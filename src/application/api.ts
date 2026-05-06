import { Elysia } from "elysia";
import jwt from "@elysia/jwt";
import cors from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import { isAuth } from "../middlewares/auth-middleware";
import auth from "../modules/auth/index";
import location from "../modules/location/index";
import presence from "../modules/presence/index";

const elysia = new Elysia({ prefix: "/api" });
elysia
  .use(
    cors({
      origin: [
        "http://localhost",
        "http://localhost:5173",
        "http://10.20.130.25:5173",
        "http://192.168.1.8:5173",
      ],
      credentials: true,
    }),
  )
  .use(
    rateLimit({
      duration: 6000 * 15 * 10,
      max: 30,
      errorResponse: new Response("To Many Request", {
        status: 429,
        headers: new Headers({
          "Content-Type": "application/json",
          "Custom-Header": "custom",
        }),
      }),
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .use(auth)
  .onBeforeHandle(isAuth)
  //setelah ini route sudah login
  .use(location)
  .use(presence);

export default elysia;
