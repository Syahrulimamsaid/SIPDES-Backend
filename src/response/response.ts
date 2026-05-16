import { status } from "elysia";

const Response = (statusCode: number, message: any) => {
  throw status(statusCode, {
    message: message,
  });
};

export { Response };
