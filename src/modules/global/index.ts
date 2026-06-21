import { Elysia } from "elysia";
import { GlobalModel } from "./model";
import { GlobalController } from "./controller";

const global = new Elysia({ prefix: "/global" });
global.get(
  "/stats",
  async ({ user }: any) => {
    const result = await GlobalController.getStats(user);
    return result;
  },
  {
    response: {
      200: GlobalModel.statsResponse,
    },
  },
).get(
  "/stats/presence",
  async ({ query, user }: any) => {
    const result = await GlobalController.getStatsPresence(query, user);
    return result;
  },
  {
    response: {
      200: GlobalModel.statsPresenceResponse,
    },
  },
);

export default global;
