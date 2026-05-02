import { status } from "elysia";

const ResponseError = (statusCode: number, message: any) => {
  throw status(statusCode, {
    message: message,
  });
};

export { ResponseError };
