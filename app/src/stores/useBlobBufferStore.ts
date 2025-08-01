import { open, type FileHandle, SeekMode } from '@tauri-apps/plugin-fs';
import { create } from 'zustand';

import { Blob } from '../proto-gen/blob';
import { useClientStore } from './useClientStore';
import Long from 'long';



type BufferHandle = {
  fileHandle: FileHandle;
  totalBlobs: number;
  receivedBlobs: number;
};

type BlobBufferStore = {
  buffers: Map<string, BufferHandle>;
  addBuffer: (blob: Blob) => Promise<void>;
  writeBuffer: (blob: Blob, onComplete: () => void) => Promise<void>;
  sendFileBlobs: (taskID: string, fileName: string, fileHandle: FileHandle) => Promise<void>; 
};


export const useBlobBufferStore = create<BlobBufferStore>((set, get) => ({
  buffers: new Map(),
  addBuffer: async (blob : Blob) => {
    const { fileName, totalChunks } = blob;
    const fileHandle = await open(fileName, {
      read: true,
      write: true,
      create: true,
    })
    set((state) => {
      const newBuffers = new Map(state.buffers);
      newBuffers.set(fileName, {
        fileHandle: fileHandle,
        totalBlobs: totalChunks,
        receivedBlobs: 0,
      })
      return { buffers: newBuffers };
    });
  },
  writeBuffer: async (blob: Blob, onComplete: () => void) => {
    const { size, data, chunkIndex, fileName } = blob;
    const offset = chunkIndex * Number(size);

    const fileHandle = get().buffers.get(blob.fileName)?.fileHandle;
    if (!fileHandle) {
      throw new Error(`File handle for ${blob.fileName} not found`);
    }

    await fileHandle.seek(offset, SeekMode.Start);
    await fileHandle.write(data);

    const buffers = get().buffers;
    const buffer = buffers.get(blob.fileName);
    console.log(`Writing chunk ${chunkIndex + 1}/${buffer?.totalBlobs} for file: ${fileName}`);
    if (buffer) {
      const updatedBuffer: BufferHandle = {
        ...buffer,
        receivedBlobs: buffer.receivedBlobs + 1,
      };

      const newBuffers = new Map(buffers);

      if (updatedBuffer.receivedBlobs === updatedBuffer.totalBlobs) {
        await fileHandle.close();
        newBuffers.delete(fileName);
        onComplete();
      } else {
        newBuffers.set(fileName, updatedBuffer);
      }

      set({ buffers: newBuffers });
    }
  },
  sendFileBlobs: async (taskID: string, fileName: string, fileHandle: FileHandle) => {
    const client = useClientStore.getState().client;
    const conn = useClientStore.getState().conn;
    if (!client || !conn) throw new Error('Client or connection not found');

    const fileInfo = await fileHandle.stat();
    const fileSize = fileInfo.size;
    const chunkSize = 2048;
    const totalChunks = Math.ceil(fileSize / chunkSize);
    let offset = 0;

    for (let i = 0; i < totalChunks; i++) {
      await fileHandle.seek(offset, SeekMode.Start);

      const buffer = new Uint8Array(2048);
      const bytesRead = await fileHandle.read(buffer);

      if (bytesRead === 0 || bytesRead === null) {
        console.warn(`No more data to read from file: ${fileName}`);
        break;
      }

      const chunkData = buffer.slice(0, bytesRead);

      const blob: Blob = {
        srcClientID: client.id,
        dstClientID: client.id,
        groupID: client.group_id,
        timestamp: new Date().toISOString(),
        size: new Long(chunkData.length),
        data: chunkData,
        fileName,
        fileType: 'application/octet-stream',
        chunkIndex: i,
        totalChunks,
        taskId: taskID,
      };
      offset += bytesRead;

      const data = Blob.encode(blob).finish();
      conn.send(data);
    }
  },

}));
