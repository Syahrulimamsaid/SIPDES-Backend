import { Elysia } from "elysia";
import { SettingModel } from "./model";
import { SettingController } from "./controller";

const setting = new Elysia({ prefix: "/setting" });
setting.patch(
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
