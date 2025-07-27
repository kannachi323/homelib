import { createContext } from "react";

export type Device = {
    name: string;
    address: string; //this must be encoded before sending
    port: number;
    type: string;
}

export type Client = {
    id: string;
    name: string;
    devices: Device[];
}

export type ClientRequest = {
    client_id: string;
    channel_name: string;
    task: string;
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
