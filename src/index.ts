import elysia from "./application/api";
elysia.listen(3333);

console.log(
  `🦊 Elysia is running at ${elysia.server?.hostname}:${elysia.server?.port}`
);