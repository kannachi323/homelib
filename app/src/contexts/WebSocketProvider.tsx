import { useState, useEffect } from "react";

import { WebSocketContext, type Channel } from "./WebSocketContext";



export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [channels, setChannels] = useState<Record<string, Channel>>({});
  const [conn, setConn] = useState<WebSocket | null>(null);

  useEffect(() => {
    const websocket = new WebSocket("ws://localhost:8080/ws");
    websocket.onopen = () => {
      sendMessage("system", "Connected to WebSocket server");
    };
  })

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
    <WebSocketContext.Provider value={{
      channels, setChannels, conn, setConn,
      subscribeToChannel, unsubscribeFromChannel,
      sendMessage
    }}>
      {children}
    </WebSocketContext.Provider>
  );
}                   