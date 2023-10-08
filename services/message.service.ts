import { redis } from "../utils/redis";

type Message = {
  userId: string;
  message: string;
};

export const storeMessage = async (message: Message) => {
  await redis.zadd("messages", {
    score: Date.now(),
    member: JSON.stringify({
      userId: message.userId,
      message: message.message,
    }),
  });
};
