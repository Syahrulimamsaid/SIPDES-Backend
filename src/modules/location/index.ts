import { Elysia, t } from "elysia";
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
  )
  .post(
    "/access",
    async ({ body, user }: any) => {
      const result = await LocationController.createAccess(body, user);
      return result;
    },
    {
      body: LocationModel.createAccessBody,
      response: {
        200: LocationModel.createAccessResponse,
      },
    },
  )
  .delete(
    "/access/:id",
    async ({ params: { id }, user }: any) => {
      const result = await LocationController.deleteAccess(id, user);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: t.Boolean(),
      },
    },
  )
  .get(
    "/access/all",
    async ({ user }: any) => {
      const result = await LocationController.getAllAccess(user);
      return result;
    },
    {
      response: {
        200: LocationModel.allAccessResponse,
      },
    },
  )
  .get(
    "/",
    async ({ user }: any) => {
      const result = await LocationController.getLocations(user);
      return result;
    },  
    {
      response: {
        200: LocationModel.locationsResponse,
      },
    },
  );

export default location;
