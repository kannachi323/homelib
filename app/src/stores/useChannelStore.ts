import { create } from 'zustand';
import { type ClientRequest, type Client } from "../stores/useClientStore";
import { useFileExplorerStore } from './useFileExplorerStore';
import { Blob  } from '../proto-gen/blob';
import { useBlobBufferStore } from './useBlobBufferStore';

export type TransferStatus =
  | "join"
  | "upload"
  | "upload-start"
  | "upload-complete"
  | "upload-error"
  | "download"
  | "download-start"
  | "download-complete";

export const TransferStatus = {
  Join: "join",
  UploadStart: "upload-start",
  UploadComplete: "upload-complete",
  UploadError: "upload-error",
  DownloadStart: "download-start",
  DownloadComplete: "download-complete",
} as const;

export type ChannelResponse = {
    client_id: string;
    channel: string;
    channel_type: string;
    task: string;
    task_id: string;
    success: boolean;
    error: string;
};

type ChannelTaskMap = Record<string, () => void>; // taskId => callback
type ChannelMap = Record<string, ChannelTaskMap>; // channelName => taskMap

type ChannelState = {
  channels: ChannelMap;

  addTask: (channelName: string, taskId: string, callback: () => void) => void;
  removeTask: (channelName: string, taskId: string) => void;

  joinTransferChannel: (client: Client | null, conn: WebSocket | null) => void;
  createTransferTask: (client: Client | null, conn: WebSocket | null, task: string) => void;
  
  handleChannelResponse: (data: string) => void;
  handleBinaryResponse: (data: ArrayBuffer) => Promise<void>;
};

export const useChannelStore = create<ChannelState>((set, get) => ({
  channels: {
    "transfer": {} as ChannelTaskMap,
  },

  addTask: (channelName, taskId, callback) => {
    set((state) => ({
      channels: {
        ...state.channels,
        [channelName]: {
          ...(state.channels[channelName] || {}),
          [taskId]: callback,
        },
      },
    }));
  },

  removeTask: (channelName, taskId) => {
    set((state) => {
      const channelTasks = state.channels[channelName] || {};
      const { [taskId]: callback, ...rest } = channelTasks; //get the task map
      if (typeof callback === "function") {
        callback();
      }
      callback();
      return {
        channels: {
          ...state.channels,
          [channelName]: rest,
        },
      };
    });
   },

  joinTransferChannel: (client, conn) => {
    if (!client) throw new Error("Client is not defined");

    const req: ClientRequest = {
      client_id: client.id,
      channel_name: `transfer:${client.id}`,
      channel_type: "transfer",
      task: "join",
    };

    if (conn?.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    } else {
      console.log("WebSocket connection is not open");
    }
  },

  createTransferTask: (client, conn, task) => {
    if (!client) throw new Error("Client is not defined");

    const req: ClientRequest = {
      client_id: client.id,
      channel_name: `transfer:${client.id}`,
      channel_type: "transfer",
      task: task,
      body: {
        dst: client.id,
        src: client.id,
      },
    };

    if (conn?.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    }
  },
  
  handleChannelResponse: (data: string) => {
    
    console.log("Received response:", data);

    const { addTask, removeTask } = get();
    
    const fetchFiles = useFileExplorerStore.getState().fetchFiles;
    const currentPath = useFileExplorerStore.getState().currentPath;

    const res = JSON.parse(data) as ChannelResponse;
        if (!res.success) {
            console.error(`Error in channel ${res.channel}: ${res.error}`);
            return;
        }

    switch (res.task) {
      case TransferStatus.Join:
        console.log(`Joined transfer channel: ${res.channel}`);
        break;

      case TransferStatus.UploadStart:
        console.log(`Upload started for taskID: ${res.task_id}`);
        addTask(res.channel, res.task_id, () => fetchFiles(currentPath));
        break;

      case TransferStatus.UploadComplete:
        console.log(`Upload completed for taskID: ${res.task_id}`);
        removeTask(res.channel, res.task_id);
        break;
    }
  },
  handleBinaryResponse: async (data: ArrayBuffer) => {
    console.log("Received ArrayBuffer response");
    const uint8Array = new Uint8Array(data);
    const blob = Blob.decode(uint8Array);
    const { buffers, addBuffer, writeBlob } = useBlobBufferStore.getState();

    if (!buffers.has(blob.fileName)) {
      console.log("First chunk received, creating buffer for:", blob.fileName);
      await addBuffer(blob);
    }

    console.log("Writing chunk to:", blob.fileName);
    await writeBlob(blob);
  }

    
}));
