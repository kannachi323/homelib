import { useState } from "react";

import { ClientContext, type Channel, type Device } from "./ClientContext";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Record<string, Channel>>({});
  const [conn, setConn] = useState<WebSocket | null>(null);
  const [clientDevices, setClientDevices] = useState<Device[]>([]);

  function createClientConnection() {
    if (conn) {
      console.warn("WebSocket connection already exists");
      return;
    }
    const websocket = new WebSocket("ws://localhost:8000/ws");
    websocket.onopen = () => {
      websocket.send(JSON.stringify({
        client_id: "client-id-placeholder",
        type: "system",
        message: "Client connected"
      }))
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
    }

    websocket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setConn(websocket);
  }

  function subscribeToChannel(channelName: string) {
    setChannels((channels) => ({
      ...channels,
      [channelName]: {
        name: channelName,
        info: `Subscribed to ${channelName}`,
        messages: []
      }
    }))
  }

  function unsubscribeFromChannel(channelName: string) {
    setChannels((channels) => {
      const newChannels = { ...channels };
      delete newChannels[channelName];
      return newChannels;
    });
  }

  function sendMessage(conn: WebSocket | null, channelName: string, message: string) {
    console.log(conn)
    console.log(conn?.readyState);
    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify({
        client_id: "client-id-placeholder",
        channel: channelName,
        message: message
      }))
    }
  }
  

  return (
    <ClientContext.Provider value={{
      conn, setConn,
      channels, setChannels, createClientConnection,
      subscribeToChannel, unsubscribeFromChannel,
      sendMessage, clientDevices, setClientDevices
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   