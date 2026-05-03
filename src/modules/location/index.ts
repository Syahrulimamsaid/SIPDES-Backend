import { Elysia } from "elysia";
import { LocationController } from "./controller";
import { LocationModel } from "../location/model";

const location = new Elysia({ prefix: "/location" });
location
  .get(
    "/access",
    async ({ user }) => {
      const result = await LocationController.getByAccess(user);
      return result;
    },
    {
      response: {
        200: LocationModel.locationResponse,
      },
    },
  )
  .post(
    "/check",
    async ({ body }) => {
      const result = await LocationController.checkLocation(body);
      return result;
    },
    {
      body: LocationModel.locationCheckBody,
      response: {
        200: LocationModel.locationCheckResponse,
      },
    },
  );

export default location;
