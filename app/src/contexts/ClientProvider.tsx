import { useState, useEffect } from "react";

import { ClientContext, type Client, type Device } from "./ClientContext";
import { useAuthContext } from "../hooks/useAuth";
import { JoinSystemChannel } from "../utils/channels/system";

function CreateConn(client: Client) : WebSocket {
  if (!client) {
    throw new Error("Client is not defined");
  }

  const socket = new WebSocket("ws://localhost:8000/ws");
    socket.onopen = () => {
      JoinSystemChannel(client, socket);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Received message:", data);
    }

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

  return socket;
}

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [conn, setConn] = useState<WebSocket | null>(null);
  const [clientDevices, setClientDevices] = useState<Device[]>([]);

  const { user, authChecked } = useAuthContext();



  useEffect(() => {
    try {
      console.log("Setting up client connection...");
      if (!authChecked || conn) {
        console.warn("Auth context not checked yet");
        return;
      } else if (!user) {
        throw new Error("User must be authenticated to create a client connection");
      }

      setClient({
        id: user.id,
        name: user.name,
        devices: []
      })

      setConn(CreateConn({
        id: user.id,
        name: user.name,
        devices: []
      }));
      
    } catch (error) {
      console.error("Error setting up client: ", error);
    }

  }, [setConn, conn, setClient, user, authChecked])

  return (
    <ClientContext.Provider value={{ client, setClient,
      conn, setConn, clientDevices, setClientDevices
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   