import { Elysia } from "elysia";
import auth from "../modules/auth/index";
import jwt from "@elysia/jwt";
import cors from "@elysiajs/cors";
import { isAuth } from "../middlewares/auth-middleware";

const elysia = new Elysia({ prefix: "/api" });
elysia
  .use(
    cors({
      origin: ["http://localhost", "http://localhost:5173", "http://10.20.130.25:5173", "http://192.168.1.8:5173"
      ],
      credentials: false,
    }),
  )
  .use(
    jwt({
      name: "jwt",
      secret: process.env.JWT_SECRET!,
    }),
  )
  .use(auth)
  .onBeforeHandle(isAuth);
//setelah ini route sudah login

export default elysia;
