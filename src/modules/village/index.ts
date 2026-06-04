import { Elysia } from "elysia";
import { VillageModel } from "./model";
import { VillageController } from "./controller";

const village = new Elysia({ prefix: "/village" });
village.get(
  "/",
  async ({ village }: any) => {
    const result = await VillageController.get(village);
    return result;
  },
  {
   response:{
    200: VillageModel.getResponse
   }
  },
);

export default village;
