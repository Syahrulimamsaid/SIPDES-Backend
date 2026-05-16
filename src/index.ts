import elysia from "./application/api";
import worker from "./workers/index";

elysia.listen(process.env.APP_PORT ?? 3333);
worker();

console.log(
  `🦊 Elysia is running at ${elysia.server?.hostname}:${elysia.server?.port}`
);