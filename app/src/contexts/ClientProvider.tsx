import { useState, useEffect } from "react";

import { ClientContext, type Client, type Device } from "./ClientContext";
import { useAuthContext } from "../hooks/useAuth";
import { Blob } from "../proto-gen/blob";
import { JoinTransferChannel } from "../utils/channels/transfer";

function CreateConn(
  client: Client,
  setBlobData: React.Dispatch<React.SetStateAction<Uint8Array[]>>
): WebSocket {
  
  const socket = new WebSocket("ws://localhost:8000/ws");
    socket.binaryType = "arraybuffer";
    
    socket.onopen = () => {
      JoinTransferChannel(client, socket)
    };

    socket.onmessage = async (event) => {
      
      if (typeof event.data === "string") {
        const data = JSON.parse(event.data);
        console.log("Received message:", data);
        return;
      } else if (event.data instanceof ArrayBuffer) {
        console.log("Received binary data");
        const uint8Array = new Uint8Array(event.data);
        try {
          const message = Blob.decode(uint8Array);
          //now convert blob.data to Uint8Array
          const blobData = new Uint8Array(message.data);
          setBlobData((prev: Uint8Array[]) => [...prev, blobData]);
          console.log("Received Protobuf message:", message);
          
        } catch (err) {
          console.error("Not a valid protobuf:", err);
        }
      }
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
  const [blobData, setBlobData] = useState<Uint8Array[]>([]);

  const { user, authChecked } = useAuthContext();


  console.log(blobData);

 useEffect(() => {
  if (!authChecked) return;
  if (!user) return;
  if (conn) return;

  console.log("Setting up client connection...");

  setClient({
    id: user.id,
    name: user.name,
    devices: [],
    master: {
      id: "",
      name: "",
      deviceType: "pc",
      ownerId: user.id,
      isCloud: true,
      lastSync: new Date(),
    }
  });

  setConn(CreateConn({
    id: user.id,
    name: user.name,
    devices: [],
    master: {
      id: "",
      name: "",
      deviceType: "pc",
      ownerId: user.id,
      isCloud: true,
      lastSync: new Date(),
    }
  }, setBlobData));

}, [authChecked, user, conn, setClient, setConn]);


  return (
    <ClientContext.Provider value={{ client, setClient,
      conn, setConn, clientDevices, setClientDevices,
      blobData, setBlobData
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   