import { Elysia } from "elysia";
import { AuthModel } from "./model";
import { jwt } from "@elysia/jwt";
import { AuthController } from "./controller";
import { isAuth } from "../../middlewares/auth-middleware";
import { Response } from "../../response/response";

const auth = new Elysia({ prefix: "/auth" });
auth
  .post(
    "/sign-in",
    async ({ body, cookie: { auth }, jwt }: any) => {
      const result = await AuthController.signIn(body, jwt);

      auth.set({
        value: result.token,
        httpOnly: true,
        secure: false,
        sameSite: "lax", // none
        path: "/",
        maxAge: 60 * 30,
      });

      return result;
    },
    {
      body: AuthModel.signInBody,
    },
  )
  .get("/sign-out", async ({ cookie: { auth } }: any) => {
    auth.remove();

    return Response(200, "Sign-Out Successfully");
  })
  .onBeforeHandle(isAuth)
  .get("/me", ({ user }: any) => {
    return user;
  })
  .post(
    "/change-password",
    async ({ body, user }: any) => {
      return await AuthController.changePassword(body, user);
    },
    {
      body: AuthModel.changePassBody,
    },
  );

export default auth;
