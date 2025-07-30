import { type ClientRequest, type Client } from "../../contexts/Client/ClientContext";

export function JoinTransferChannel(client: Client | null, conn : WebSocket | null) {
    if (!client) {
        throw new Error("Client is not defined");
    }

    const req: ClientRequest = {
        client_id: client.id,
        channel_name: `transfer:${client.id}`,
        channel_type: "transfer",
        task: "join",
    }

    if (conn && conn.readyState === WebSocket.OPEN) {
      conn.send(JSON.stringify(req));
    } else {
        console.log("WebSocket connection is not open");
    }
}

export function CreateTransferTask(client: Client | null, conn: WebSocket | null, task: string) {
    if (!client) {
        throw new Error("Client is not defined");
    }

    console.log(client.id);

    const req : ClientRequest = {
        client_id: client.id,
        channel_name: `transfer:${client.id}`,
        channel_type: "transfer",
        task: task,
        body: {
            dst: client.id,
            src: client.id
        }
    }

    if (conn && conn.readyState === WebSocket.OPEN) {
        conn.send(JSON.stringify(req));
    }
}