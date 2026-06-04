import { Elysia } from "elysia";
import { UserModel } from "./model";
import { UserController } from "./controller";

const user = new Elysia({ prefix: "/user" });
user.get(
  "/",
  async ({ user }: any) => {
    const result = await UserController.get(user);
    return result;
  },
  {
   response:{
    200: UserModel.getResponse
   }
  },
);

export default user;
