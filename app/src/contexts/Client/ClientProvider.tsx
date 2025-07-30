import { useState, useEffect } from "react";

import { ClientContext, type Client, type Device } from "./ClientContext";
import { useAuthContext } from "../../hooks/useAuth";

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [conn, setConn] = useState<WebSocket | null>(null);
  const [clientDevices, setClientDevices] = useState<Device[]>([]);
  const [taskQueue, setTaskQueue] = useState<Record<string, () => void>>({});
  const [blobData, setBlobData] = useState<Uint8Array[]>([]);

  const { user, authChecked } = useAuthContext();

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
  }, setBlobData, setTaskQueue));

}, [authChecked, user, conn, setClient, setConn]);


  return (
    <ClientContext.Provider value={{ client, setClient,
      conn, setConn, clientDevices, setClientDevices,
      blobData, setBlobData, taskQueue, setTaskQueue
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   