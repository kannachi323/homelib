import { open, type FileHandle, SeekMode } from '@tauri-apps/plugin-fs';
import { create } from 'zustand';
import { Blob } from '../proto-gen/blob';
import { useClientStore } from './useClientStore';
import { Mutex } from 'async-mutex';
import Long from 'long';

type BufferHandle = {
  fileHandle: FileHandle;
  totalBlobs: number;
  receivedBlobs: number;
  mutex: Mutex;
};

type BlobBufferStore = {
  buffers: Map<string, BufferHandle>;
  addBuffer: (blob: Blob) => Promise<void>;
  writeBuffer: (blob: Blob) => Promise<void>;
  sendFileBlobs: (taskID: string, fileName: string, fileHandle: FileHandle) => Promise<void>;
};

const fileMutexes = new Map<string, Mutex>();

export const useBlobBufferStore = create<BlobBufferStore>((set, get) => ({
  buffers: new Map(),

  addBuffer: async (blob: Blob) => {
    const { fileName, totalChunks } = blob;

    const fileHandle = await open(fileName, {
      read: true,
      write: true,
      create: true,
    });

    const mutex = new Mutex();

    set((state) => {
      const newBuffers = new Map(state.buffers);
      newBuffers.set(fileName, {
        fileHandle: fileHandle,
        totalBlobs: totalChunks,
        receivedBlobs: 0,
        mutex: mutex,
      });
      return { buffers: newBuffers };
    });
  },
  writeBuffer: async (blob: Blob) => {
    const { data, chunkIndex, fileName, size } = blob;

    const buffers = get().buffers;
    const bufferHandle = buffers.get(fileName);
    if (!bufferHandle) throw new Error(`No buffer found for file: ${fileName}`);

    await bufferHandle.mutex.runExclusive(async () => {
      const bufferSize = 2 * 1024 * 1024;
      const offset = chunkIndex * bufferSize;
      const fileHandle = bufferHandle.fileHandle;

      await fileHandle.seek(offset, SeekMode.Start);
      const blobData = data.slice(0, size.toInt());
      await fileHandle.write(blobData);

      const updatedBufferHandle: BufferHandle = {
        ...bufferHandle,
        receivedBlobs: bufferHandle.receivedBlobs + 1,
        mutex: bufferHandle.mutex
      };

      const newBuffers = new Map(buffers);

      if (updatedBufferHandle.receivedBlobs >= updatedBufferHandle.totalBlobs) {
        await fileHandle.close();
        newBuffers.delete(fileName);
        fileMutexes.delete(fileName);
      } else {
        newBuffers.set(fileName, updatedBufferHandle);
      }

      set({ buffers: newBuffers });
    });
  },


  sendFileBlobs: async (taskID: string, fileName: string, fileHandle: FileHandle) => {
    const { client, conn } = useClientStore.getState();
    if (!client || !conn) throw new Error('Client or connection not found');

    const fileInfo = await fileHandle.stat();
    const fileSize = fileInfo.size;

    const bufferSize = 2 * 1024 * 1024;

    const totalBlobs = Math.ceil(fileSize / bufferSize);

    for (let i = 0; i < totalBlobs; i++) {
      const offset = i * bufferSize;
      await fileHandle.seek(offset, SeekMode.Start);

      const buffer = new Uint8Array(bufferSize);
      const bytesRead = await fileHandle.read(buffer);

      if (!bytesRead) {
        console.warn(`No more data to read from file: ${fileName}`);
        break;
      }

      const blobData = buffer.slice(0, bytesRead);

      const blob: Blob = {
        srcClientID: client.id,
        dstClientID: client.id,
        groupID: client.group_id,
        timestamp: new Date().toISOString(),
        size: Long.fromNumber(blobData.length),
        data: blobData,
        fileName: fileName,
        fileType: 'application/octet-stream',
        chunkIndex: i,
        totalChunks: totalBlobs,
        taskId: taskID,
      };

      const encoded = Blob.encode(blob).finish();
      conn.send(encoded);
    }

    const completeMsg = {
      client_id: client.id,
      group_id: client.group_id,
      channel_name: "transfer",
      task: "upload-complete",
      task_id: taskID,
      body: {}
    };

    if (conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(completeMsg));
      console.log(`Sent upload-complete for taskID: ${taskID}, file: ${fileName}`);
    }
  },
}));

