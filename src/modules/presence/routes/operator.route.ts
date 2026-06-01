import { Elysia } from "elysia";
import { PresenceController } from "../controller";
import { PresenceModel } from "../../presence/model";
import { Response } from "../../../response/response";
import presenceModel from "../../../models/presence.model";

const operator = new Elysia({ prefix: "/operator/presence" });
operator
  .get(
    "/",
    async ({ query, user }: any) => {
      const result = await PresenceController.get(query, user);
      return result;
    },
    {
      response: {
        200: PresenceModel.presenceGetResponse,
      },
    },
  )
  .patch(
    "/",
    async ({ body, user }: any) => {
      await PresenceController.update(body, user);
      return Response(200, "Update successfully");
    },
    {
      body: PresenceModel.updateBody,
      response: {
        200: PresenceModel.presenceGetResponse,
      },
    },
  )
  .delete("/:id", async ({ params: { id }, user }: any) => {
    const result = await PresenceController.destory(id, user);

    if (result) return Response(200, "Deleting successfully");
  });

export default operator;
