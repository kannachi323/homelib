import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useChannelStore } from './useChannelStore';

export type Device = {
    id: string;
    ownerID: string;
    name: string;
    size: number;
    isMaster: boolean;
}

export type Client = {
    id: string;
    name: string;
    devices: Device[];
    master: Device
}

export type ClientRequest = {
    client_id: string;
    channel_name: string;
    channel_type: string;
    task: string;
    body?: {dst: string; src: string};
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
        name: user.name,
        devices: [],
        master: {
            id: user.id, 
            ownerID: user.id,
            name: user.name,
            size: 0,
            isMaster: true,
        }
    };

    return newClient;
}

function createConn(): WebSocket {
    const client = useClientStore.getState().client;
    const joinTransferChannel = useChannelStore.getState().joinTransferChannel;
    const handleChannelResponse = useChannelStore.getState().handleChannelResponse;
    const handleBinaryResponse = useChannelStore.getState().handleBinaryResponse;

    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.binaryType = "arraybuffer";

    socket.onopen = () => joinTransferChannel(client, socket);
    socket.onmessage = (event) => {
        const data = event.data;
        if (typeof data === 'string') {
            console.log('Received a string message:', data);
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