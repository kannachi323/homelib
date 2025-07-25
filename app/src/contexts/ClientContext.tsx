import { createContext } from "react";

export type Channel = {
    name: string;
    info: string;
    messages: string[];
}

export type Device = {
    name: string;
    address: string; //this must be encoded before sending
    port: number;
    type: string;
}

export type ClientContextType = {
    channels: Record<string, Channel>;
    setChannels: (channels: Record<string, Channel>) => void;
    createClientConnection: () => void;
    subscribeToChannel: (channelName: string) => void;
    unsubscribeFromChannel: (channelName: string) => void;
    sendMessage: (channelName: string, message: string) => void;
    clientDevices: Device[];
    setClientDevices: (devices: Device[]) => void;
};

export const ClientContext = createContext<ClientContextType | undefined>(undefined);
