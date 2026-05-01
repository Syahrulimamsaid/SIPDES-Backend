import { Elysia } from "elysia";

const elysia = new Elysia().get("/", () => "Hello Elysia");
export default elysia;  