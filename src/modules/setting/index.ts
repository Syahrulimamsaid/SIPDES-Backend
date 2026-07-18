import { Elysia } from "elysia";
import { SettingModel } from "./model";
import { SettingController } from "./controller";

const setting = new Elysia({ prefix: "/setting" });
setting
  .get(
    "/",
    async () => {
      const result = await SettingController.get();
      return result;
    },
    {
      response: {
        200: SettingModel.getResponse,
      },
    },
  )
  .patch(
    "/",
    async ({ body, user }: any) => {
      const result = await SettingController.update(body, user);
      return result;
    },
    {
      body: SettingModel.updateBody,
      response: {
        200: SettingModel.updateResponse,
      },
    },
  );

export default setting;
