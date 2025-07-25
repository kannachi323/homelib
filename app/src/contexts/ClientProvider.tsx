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
      sendMessage("system", "Connected to WebSocket server");
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

  function sendMessage(channelName: string, message: string) {
    //the pub sub model is always at /sub, /pub on the proxy
    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify({
        channel: channelName,
        message: message
      }))
    }
  }
  

  return (
    <ClientContext.Provider value={{
      channels, setChannels, createClientConnection,
      subscribeToChannel, unsubscribeFromChannel,
      sendMessage, clientDevices, setClientDevices
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   