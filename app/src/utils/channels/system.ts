import { type ClientRequest, type Client } from "../../contexts/ClientContext";

export function JoinSystemChannel(client: Client | null, conn : WebSocket | null) {
    if (!client) {
        throw new Error("Client is not defined");
    }

    const req: ClientRequest = {
        client_id: client.id,
        channel_name: "system",
        task: "join",
    }

    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    }

}