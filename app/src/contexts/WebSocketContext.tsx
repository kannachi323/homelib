import { createContext } from "react";

export type Channel = {
    name: string;
    info: string;
    messages: string[];
}

export type WebSocketContextType = {
    channels: Record<string, Channel>;
    setChannels: (channels: Record<string, Channel>) => void;
    conn: WebSocket | null;
    setConn: (conn: WebSocket | null) => void;
    subscribeToChannel: (channelName: string) => void;
    unsubscribeFromChannel: (channelName: string) => void;
    sendMessage: (channelName: string, message: string) => void;
};

export const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);
