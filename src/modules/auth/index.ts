import { Elysia } from "elysia";
import { AuthModel } from "./model";
import { jwt } from "@elysia/jwt";
import { AuthController } from "./controller";
import { isAuth } from "../../middlewares/auth-middleware";

const auth = new Elysia({ prefix: "/auth" });
auth
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .post("/sign-in", async ({ body, cookie: { session }, jwt }) => {
    const result = await AuthController.signIn(body, jwt);

    session.set({
      value: result.token,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60,
    });

    return result;
  })
  .onBeforeHandle(isAuth)
  .get("/me", ({ user }) => {
    return user;
  });

export default auth;
