import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const port = Number(process.env.GAME_PORT || 2567);
const worldEdits = new Map();
const players = new Map();
const MAX_COORDINATE = 512;
const MAX_WORLD_EDITS = 10000;

const wss = new WebSocketServer({ port });

function send(socket, message) {
  if (socket.readyState === 1) socket.send(JSON.stringify(message));
}

function broadcast(message, exclude) {
  for (const client of wss.clients) {
    if (client !== exclude) send(client, message);
  }
}

function safeCoordinate(value) {
  return Number.isInteger(value) && Math.abs(value) <= MAX_COORDINATE;
}

function safePosition(value) {
  return Number.isFinite(value) && Math.abs(value) <= MAX_COORDINATE;
}

function worldSnapshot() {
  return {
    type: "welcome",
    blocks: [...worldEdits.values()],
    players: [...players.values()],
  };
}

wss.on("connection", (socket) => {
  const id = randomUUID().slice(0, 8);
  const player = { id, x: 0, y: 52, z: 0, yaw: 0, color: `hsl(${Math.floor(Math.random() * 360)} 58% 62%)` };
  players.set(id, player);

  send(socket, { ...worldSnapshot(), id });
  broadcast({ type: "player-join", player }, socket);

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch {
      return;
    }

    if (message.type === "move") {
      const { x, y, z, yaw } = message;
      if (![x, y, z, yaw].every(safePosition)) return;
      Object.assign(player, { x, y, z, yaw });
      broadcast({ type: "player-move", player }, socket);
      return;
    }

    if (message.type === "block") {
      const { x, y, z, block } = message;
      if (![x, y, z].every(safeCoordinate) || !Number.isInteger(block) || block < 0 || block > 9) return;
      const key = `${x},${y},${z}`;
      if (!worldEdits.has(key) && worldEdits.size >= MAX_WORLD_EDITS) return;
      const edit = { x, y, z, block };
      worldEdits.set(key, edit);
      broadcast({ type: "block", ...edit }, socket);
    }
  });

  socket.on("close", () => {
    players.delete(id);
    broadcast({ type: "player-leave", id });
  });
});

console.log(`Blockworks LAN server listening on ws://0.0.0.0:${port}`);
