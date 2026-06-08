import { Elysia, t } from "elysia";
import { UserModel } from "./model";
import { UserController } from "./controller";

const user = new Elysia({ prefix: "/user" });
user
  .get(
    "/",
    async ({ user }: any) => {
      const result = await UserController.get(user);
      return result;
    },
    {
      response: {
        200: UserModel.getResponse,
      },
    },
  )
  .post(
    "/",
    async ({ body, user }: any) => {
      const result = await UserController.create(body, user);
      return result;
    },
    {
      body: UserModel.createBody,
      response: {
        200: UserModel.createResponse,
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, user }: any) => {
      const result = await UserController.update(id, body, user);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: UserModel.updateBody,
      response: {
        200: UserModel.updateResponse,
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, user }: any) => {
      const result = await UserController.destroy(id, user);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Boolean(),
      },
    },
  );

export default user;
