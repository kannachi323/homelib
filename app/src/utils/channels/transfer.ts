
import { getFetchFiles } from "../../globalFileExplorer";


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

    return 
}

export function onUploadComplete() {
    
    const fetchFiles = getFetchFiles();
    if (!fetchFiles) {
        console.error("Fetch files function is not defined");
        return;
    }
    fetchFiles("");
}

export function handleTransfer(res: ChannelResponse, 
    addTask: (taskId: string, callback: () => void) => void, 
    removeTask: (taskId: string) => void)
{
    switch (res.task) {
        case TransferStatus.Join:
            console.log(`Joined transfer channel: ${res.channel}`);
            break;
        case TransferStatus.UploadStart: {
            console.log(`Upload started for taskID: ${res.task}`);
            addTask(res.task_id, () => {});
            break;
        }
        case TransferStatus.UploadComplete:
            console.log(`Upload completed for taskID: ${res.task_id}`);
            removeTask(res.task_id);
            break;
        default:
            console.warn(`Unhandled transfer task: ${res.task}`);
    }
}




