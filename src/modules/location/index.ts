import { Elysia } from "elysia";
import { LocationController } from "./controller";
import { LocationModel } from "../location/model";

const location = new Elysia({ prefix: "/location" });
location
  .get(
    "/access",
    async ({ user }:any) => {
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
  )
  .post(
    "/access/user",
    async ({ body }) => {
      const result = await LocationController.getByAccessUser(body);
      return result;
    },
    {
      body: LocationModel.locationAccessByUserBody,
      response: {
        200: LocationModel.locationAccessUserResponse,
      },
    },
  );

export default location;
