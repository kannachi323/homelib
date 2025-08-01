import { create } from 'zustand';
import { type ClientRequest, useClientStore } from "../stores/useClientStore";
import { useFileExplorerStore } from './useFileExplorerStore';
import { Blob  } from '../proto-gen/blob';
import { useBlobBufferStore } from './useBlobBufferStore';
import { v4 as uuidv4 } from 'uuid';

export const TransferTask = {
  Join: "join",
  Upload: "upload",
  UploadStart: "upload-start",
  UploadComplete: "upload-complete",
  UploadError: "upload-error",
  Download: "download",
  DownloadStart: "download-start",
  DownloadComplete: "download-complete",
  DownloadError: "download-error",
} as const;


export type ChannelResponse = {
  client_id: string;
  group_id: string;
  channel_name: string;
  channel_id: string;
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

  joinTransferChannel: () => void;
  createTransferTask: (task: string, srcClientID: string, dstClientID: string) => string | null;
  
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
      const { [taskId]: callback, ...rest } = channelTasks;
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

  joinTransferChannel: () => {
    const client = useClientStore.getState().client;
    if (!client) throw new Error("Client is not defined");
    const conn = useClientStore.getState().conn;
    if (!conn) throw new Error("WebSocket connection is not defined");

    const req: ClientRequest = {
      client_id: client.id,
      group_id: client.group_id,
      channel_name: "transfer",
      task: "join",
      task_id: uuidv4(),
      body: {}
    };

    if (conn?.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    } else {
      console.log("WebSocket connection is not open");
    }
  },

  createTransferTask: (task, srcClientID, dstClientID) => {
    const client = useClientStore.getState().client;
    if (!client) throw new Error("Client is not defined");
    const conn = useClientStore.getState().conn;
    if (!conn) throw new Error("WebSocket connection is not defined");

    const newTaskID = uuidv4();
    const req: ClientRequest = {
      client_id: client.id,
      group_id: client.group_id,
      channel_name: "transfer",
      task: task,
      task_id: newTaskID,
      body: {
        src_client_id: srcClientID,
        dst_client_id: dstClientID,
      },
    };

    if (conn?.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
      return newTaskID;
    }

    return null;
  },
  
  handleChannelResponse: (data: string) => {
    
    console.log("Received response:", data);

    const { addTask, removeTask } = get();
    
    const fetchFiles = useFileExplorerStore.getState().fetchFiles;
    const currentPath = useFileExplorerStore.getState().currentPath;

    const res = JSON.parse(data) as ChannelResponse;
    if (!res.success) {
        console.error(`Error in channel ${res.channel_name}: ${res.error}`);
        return;
    }

    switch (res.task) {
      case TransferTask.Join:
        console.log(`Joined transfer channel: ${res.client_id}`);
        break;
      

      case TransferTask.UploadStart:
        console.log(`Upload started for taskID: ${res.task_id}`);
        addTask(res.channel_name, res.task_id, () => fetchFiles(currentPath));
        break;

      case TransferTask.UploadComplete:
        console.log(`Upload completed for taskID: ${res.task_id}`);
        removeTask(res.channel_name, res.task_id);
        break;
    }
  },
  handleBinaryResponse: async (data: ArrayBuffer) => {
    const client = useClientStore.getState().client;
    if (!client) throw new Error("Client is not defined");
    const conn = useClientStore.getState().conn;
    if (!conn) throw new Error("WebSocket connection is not defined");


    const uint8Array = new Uint8Array(data);
    const blob = Blob.decode(uint8Array);
    const { buffers, addBuffer, writeBuffer } = useBlobBufferStore.getState();

    if (!buffers.has(blob.fileName)) {
      console.log("First chunk received, creating buffer for:", blob.fileName);
      await addBuffer(blob);
    }

    const onComplete = () => {
      
      const req: ClientRequest = {
        client_id: client.id,
        group_id: client.group_id,
        channel_name: "transfer",
        task: TransferTask.UploadComplete,
        task_id: blob.taskId,
        body: {}
      };
      if (conn?.readyState === WebSocket.OPEN) {
        conn.send(JSON.stringify(req));
      }
    };
    await writeBuffer(blob, onComplete);
  }

    
}));
