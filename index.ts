import { v4 as uuidv4 } from "uuid";
import { storeMessage } from "./services/message.service";

const server = Bun.serve<{ userId: string }>({
  port: 3000,
  websocket: {
    open: (ws) => {
      ws.subscribe("chat");
      console.log("Client connected");
      const userId = ws.data.userId;

      const payload = JSON.stringify({
        message: `Guest ${userId} has entered the chat`,
      });
      server.publish("chat", payload);
    },
    message: async (ws, message) => {
      console.log("Client sent message", message);
      const userId = ws.data.userId;

      // only handling string messages for now
      if (typeof message === "string") {
        await storeMessage({ userId, message });
      }

      const payload = JSON.stringify({
        message: `Guest ${userId}: ${message}`,
      });
      server.publish("chat", payload);
    },
    close: (ws) => {
      console.log("Client disconnected");
      ws.unsubscribe("chat");
      const userId = ws.data.userId;

      const payload = JSON.stringify({
        message: `Guest ${userId} has left the chat`,
      });
      server.publish("chat", payload);
    },
  },
  fetch(req, server) {
    const url = new URL(req.url);

    // upgrade request to websocket
    const userId = uuidv4();
    if (url.pathname === "/chat") {
      const upgraded = server.upgrade(req, {
        data: { userId },
      });
      if (!upgraded) {
        return new Response("Upgrade failed", { status: 400 });
      }
    }

    return new Response("Test");
  },
});

console.log(`Listening on port ${server.port}`);
