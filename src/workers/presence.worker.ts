import { PresenceController } from "../modules/presence/controller";
import redis from "../config/redis";

async function presenceWorker() {
  console.log("Presence worker started");

  while (true) {
    try {
      const delay = Number(process.env.WORKER_DELAY ?? "500");
      await new Promise((resolve) => setTimeout(resolve, delay));
      
      const result = await redis.brpop("presence", 1);

      if (!result) continue;

      const [, userId] = result;
      const payloadStr = await redis.rpop(`presence:${userId}`);
      if (!payloadStr) continue;

      const payload = JSON.parse(payloadStr);

      await PresenceController.presence(payload);
    } catch (error) {
      console.error(error);
    }
  }
}

export default presenceWorker;
