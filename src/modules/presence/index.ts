import { Elysia } from "elysia";
import { PresenceController } from "./controller";
import { PresenceModel } from "../presence/model";

const location = new Elysia({ prefix: "/presence" });
location
  .get(
    "/",
    async ({ user }) => {
      const result = await PresenceController.get(user);
      return result;
    },
    {
      response: {
        200: PresenceModel.presenceGetResponse,
      },
    },
  )
  .post(
    "/",
    async ({ body, user }) => {
      const result = await PresenceController.presence(body, user);
      return result;
    },
    {
      body: PresenceModel.presenceBody,
      response: {
        200: PresenceModel.presenceResponse,
      },
    },
  );

export default location;
