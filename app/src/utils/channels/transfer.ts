import { type ClientRequest, type Client } from "../../contexts/Client/ClientContext";
import { type ChannelResponse } from "../../hooks/useChannels";


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
    Upload: "upload",
    UploadStart: "upload-start",
    UploadComplete: "upload-complete",
    UploadError: "upload-error",
    Download: "download",
    DownloadStart: "download-start",
    DownloadComplete: "download-complete",
} as const;


export function joinTransferChannel(client: Client | null, conn : WebSocket | null) {
    if (!client) {
        throw new Error("Client is not defined");
    }

    const req: ClientRequest = {
        client_id: client.id,
        channel_name: `transfer:${client.id}`,
        channel_type: "transfer",
        task: "join",
    }

    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    } else {
        console.log("WebSocket connection is not open");
    }
}

export function createTransferTask(client: Client | null, conn: WebSocket | null, task: string) {
    if (!client) {
        throw new Error("Client is not defined");
    }

    const req : ClientRequest = {
        client_id: client.id,
        channel_name: `transfer:${client.id}`,
        channel_type: "transfer",
        task: task,
        body: {
            dst: client.id,
            src: client.id
        }
    }

    if (conn && conn.readyState === WebSocket.OPEN) {
        conn.send(JSON.stringify(req));
    }
}

export function handleTransfer(res: ChannelResponse, addTask: (taskId: string, callback: () => void) => void, removeTask: (taskId: string) => void) {
    switch (res.task) {
        case TransferStatus.Join:
            console.log(`Joined transfer channel: ${res.channel}`);
            break;
        case TransferStatus.UploadStart:
            console.log("Transfer started");
            //we need to add this new task to the taskQueue
            addTask(res.task_id, () => console.log(`Transfer task ${res.task_id} completed`));
            break;
        case TransferStatus.UploadComplete:
            removeTask(res.task_id);
            break;
        default:
            console.warn(`Unhandled transfer task: ${res.task}`);
    }
}




