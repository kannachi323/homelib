import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useChannelStore } from './useChannelStore';

export type Device = {
    id: string;
    owner_id: string;
    name: string;
    size: number;
    isMaster: boolean;
}

export type Client = {
    id: string;
    group_id: string;
    name: string;
    devices: Device[];
    master: Device
}

export type ClientRequest = {
    client_id: string;
    group_id: string;
    channel_name: string;
    task: string;
    task_id : string;
    body?: object;
}

type ClientState = {
    client: Client | null;
    conn: WebSocket | null;
    devices: Device[];

    setDevices: (devices: Device[]) => void;  
    syncClient: () => boolean;
}

function createClient(user: { id: string; name: string }): Client {
    const newClient : Client = {
        id: user.id,
        group_id: user.id, // Assuming group_id is the same as user id for simplicity
        name: user.name,
        devices: [],
        master: {
            id: user.id, 
            owner_id: user.id,
            name: user.name,
            size: 0,
            isMaster: true,
        }
    };

    return newClient;
}

function createConn(): WebSocket {
    const joinTransferChannel = useChannelStore.getState().joinTransferChannel;
    const handleChannelResponse = useChannelStore.getState().handleChannelResponse;
    const handleBinaryResponse = useChannelStore.getState().handleBinaryResponse;

    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.binaryType = "arraybuffer";

    socket.onopen = () => joinTransferChannel();
    socket.onmessage = (event) => {
        const data = event.data;
        if (typeof data === 'string') {
            const parsedData = JSON.parse(data);
            console.log('Received a string message:', parsedData);
            handleChannelResponse(data);
        } else if (data instanceof ArrayBuffer) {
            console.log('Received a binary message');
            // Handle binary message (e.g. protobuf)
            handleBinaryResponse(data);
        } else {
            console.warn('Unknown message type:', data);
        }
    };

    socket.onclose = () => {
        console.log("WebSocket connection closed");
    };

    return socket;
}



export const useClientStore = create<ClientState>((set) => ({
    client: null,
    conn: null,
    devices: [],

    setDevices: (devices) => set({ devices: devices }),

    syncClient: () => {
        const user = useAuthStore.getState().user;
        if (!user) {
            set({ client: null });
            return false;
        }
        
        set({ client: createClient(user) });
        set({ conn:  createConn() })

        return true;
    }

}));