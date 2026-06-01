import { Elysia } from "elysia";
import { PresenceController } from "../controller";
import { PresenceModel } from "../../presence/model";

const user = new Elysia({ prefix: "/presence" });
user
  .get(
    "/:periode",
    async ({ params: { periode }, user }: any) => {
      const result = await PresenceController.getByUser(periode, user);
      return result;
    },
    {
      response: {
        200: PresenceModel.presenceGetResponse,
      },
    },
  )
  .get(
    "/id/:id",
    async ({ params: { id }, user }: any) => {
      const result = await PresenceController.getById(id, user);
      return result;
    },
    {
      response: {
        200: PresenceModel.presenceGetSingleResponse,
      },
    },
  )
  .post(
    "/",
    async ({ body, user }: any) => {
      const result = await PresenceController.presenceQueue(body, user);
      return result;
    },
    {
      body: PresenceModel.presenceBody,
      response: {
        200: PresenceModel.presenceResponse,
      },
    },
  )
  .get(
    "/process",
    async ({ user }: any) => {
      const result = await PresenceController.getByQueue(user);
      return result;
    },
    {
      response: {
        200: PresenceModel.presenceQueue,
      },
    },
  );

export default user;
