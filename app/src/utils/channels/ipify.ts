import { type ClientRequest, type Client } from "../../contexts/ClientContext";

function sendTask(client: Client, conn: WebSocket, channel_name: string, channel_type: string, task: string) {
  const req: ClientRequest = {
    client_id: client.id,
    channel_name: channel_name,
    task: task,
    channel_type: channel_type,
  };

  conn.send(JSON.stringify(req));
}

export function JoinIpify(client: Client | null, conn: WebSocket | null) {
  if (!client) throw new Error("Client is not defined");
  if (!conn || conn.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket connection not open");
    return;
  }

  sendTask(client, conn, `ipify:${client.id}`, "ipify", "join");
}

export function GetLocalIP(client: Client | null, conn: WebSocket | null) {
  if (!client) throw new Error("Client is not defined");
  if (!conn || conn.readyState !== WebSocket.OPEN) {
    console.warn("WebSocket connection not open");
    return;
  }

  sendTask(client, conn, `ipify:${client.id}`, "ipify", "get_ip");
}
