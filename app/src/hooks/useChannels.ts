import { useTaskQueue } from "./useTaskQueue";
import { handleTransfer } from "../utils/channels/transfer";

export type ChannelResponseData = {
    message: string;
};

export type ChannelResponse = {
    client_id: string;
    channel: string;
    task: string;
    task_id: string;
    success: boolean;
    error: string;
};


export function useChannels() {
    const { addTask, removeTask } = useTaskQueue();


    if (!addTask || !removeTask) {
        throw new Error("Task queue is not initialized");
    }

    const handlers : Record<string, (res: ChannelResponse) => void> = {
        "transfer": (res: ChannelResponse) => {
            handleTransfer(res, addTask, removeTask);
        }
    }

    const handleChannelResponse = (res: ChannelResponse) => {
        if (!res.success) {
            console.error(`Error in channel ${res.channel}: ${res.error}`);
            return;
        }

        console.log(res);

        const handler = handlers[res.channel.split(":")[0]];
        if (handler) {
            handler(res);
        } else {
            console.warn(`No handler registered for channel: ${res.channel}`);
        }
    };

    return { handleChannelResponse };
}
