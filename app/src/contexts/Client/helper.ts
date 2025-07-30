import { Blob } from "../../proto-gen/blob";
import { JoinTransferChannel } from "../../utils/channels/transfer";
import { type Client } from "./ClientContext";


type ChannelResponse = {
    client_id: string;
    channel: string;
    task: string;
    task_id: string;
    success: boolean;
    data: ChannelResponseData;
    error: string;
};

type ChannelResponseData = {
    message: string;
};


export function handleChannelResponse(res: ChannelResponse, setTaskQueue: React.Dispatch<React.SetStateAction<Record<string, () => void>>>) {
    if (!res.success) {
        console.error(`Error in channel ${res.channel}: ${res.error}`);
        return;
    }

    switch (res.channel) {
        case "transfer":
            handleTransfer(res, setTaskQueue);
            break;
        
        default:
            console.warn(`Unhandled channel response: ${res.channel}`);
    }
}


function handleTransfer(res: ChannelResponse, setTaskQueue: React.Dispatch<React.SetStateAction<Record<string, () => void>>>) {
    switch (res.data.message) {
        case "start":
            console.log("Transfer started");
            //we need to add this new task to the taskQueue
            setTaskQueue((prev) => {
                const newQueue = { ...prev };
                const taskCallback = () => {
                    console.log("transfer task finished");
                };
                newQueue[res.task_id] = taskCallback;
                return newQueue;
            });
            break;
        case "finish":
            setTaskQueue((prev) => {
                const newQueue = { ...prev };
                newQueue[res.task_id]?.();
                delete newQueue[res.task_id];
                return newQueue;
            })
            break;
        default:
            console.warn(`Unhandled transfer message: ${res.data.message}`);
    }
}


function CreateConn(
  client: Client,
  setBlobData: React.Dispatch<React.SetStateAction<Uint8Array[]>>,
  setTaskQueue: React.Dispatch<React.SetStateAction<Record<string, () => void>>>
): WebSocket {
  
  const socket = new WebSocket("ws://localhost:8080/ws");
    socket.binaryType = "arraybuffer";
    
    socket.onopen = () => {
      JoinTransferChannel(client, socket)
    };

    socket.onmessage = async (event) => {
      
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        handleChannelResponse(data, setTaskQueue);
        return;
      } else if (event.data instanceof ArrayBuffer) {
        console.log("Received binary data");
        const uint8Array = new Uint8Array(event.data);
        try {
          const message = Blob.decode(uint8Array);
          //now convert blob.data to Uint8Array
          const blobData = new Uint8Array(message.data);
          setBlobData((prev: Uint8Array[]) => [...prev, blobData]);
          console.log("Received Protobuf message:", message);
          
        } catch (err) {
          console.error("Not a valid protobuf:", err);
        }
      }
    }

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

  return socket;
}