import { useState, useEffect } from "react";

import { ClientContext, type Client, type Device } from "./ClientContext";
import { useAuthContext } from "../../hooks/useAuth";
import { useChannels, type ChannelResponse } from "../../hooks/useChannels";
import { useBlobData } from "../../hooks/useBlobData";  
import { joinTransferChannel } from '../../utils/channels/transfer';


export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [client, setClient] = useState<Client | null>(null);
  const [conn, setConn] = useState<WebSocket | null>(null);
  const [clientDevices, setClientDevices] = useState<Device[]>([]);


  const { handleBinaryMessage } = useBlobData();
  const { handleChannelResponse } = useChannels();
  const { user, authChecked } = useAuthContext();

  useEffect(() => {
    if (!authChecked || !user) return;

    console.log("Setting up client connection...");

    const newClient: Client = {
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
    };
    setClient(newClient);
  }, [authChecked, user]);

  useEffect(() => {
    if (!client) return;
    const socket = new WebSocket("ws://localhost:8080/ws");
    socket.binaryType = "arraybuffer";

    socket.onopen = () => joinTransferChannel(client, socket);
    socket.onmessage = (event) => {
      if (typeof event.data === "string") {
        const res = JSON.parse(event.data) as ChannelResponse;
        handleChannelResponse(res);
      } else if (event.data instanceof ArrayBuffer) {
        handleBinaryMessage(event.data);
      }
    };

    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };

    setConn(socket);

    // optional cleanup
    return () => {
      socket.close();
    };

  }, [client])


  return (
    <ClientContext.Provider value={{ client, setClient,
      conn, setConn, clientDevices, setClientDevices,
    }}>
      {children}
    </ClientContext.Provider>
  );
}                   