import { createContext } from "react";

export type Device = {
    id: string;
    name: string;
    deviceType: string;
    ownerId: string;
    isCloud: boolean;
    lastSync: Date;
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

export type ClientContextType = {
    client: Client | null;
    setClient: (client: Client) => void;
    conn: WebSocket | null;
    setConn: (conn: WebSocket | null) => void;
    clientDevices: Device[];
    setClientDevices: (devices: Device[]) => void;
};


export const ClientContext = createContext<ClientContextType | undefined>(undefined);
