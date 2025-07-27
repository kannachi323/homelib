import { type ClientRequest, type Client } from "../../contexts/ClientContext";

function sendTask(client: Client | null, conn: WebSocket | null, channel_name: string, task: string) {
  if (!client) throw new Error("Client is not defined");
  if (!conn || conn.readyState !== WebSocket.OPEN) return;

  const req: ClientRequest = {
    client_id: client.id,
    channel_name,
    task,
  };

  conn.send(JSON.stringify(req));
}


export function JoinIpify(client: Client | null, conn : WebSocket | null) {
    sendTask(client, conn, "ipify", "join");

}

export function GetLocalIP(client: Client | null, conn : WebSocket | null) {
    sendTask(client, conn, "ipify", "get_ip");
}