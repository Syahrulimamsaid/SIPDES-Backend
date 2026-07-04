import { Elysia, t } from "elysia";
import { SubDistrictModel } from "./model";
import { SubDistrictController } from "./controller";

const subDistrict = new Elysia({ prefix: "/sub-district" });
subDistrict
  .get(
    "/",
    async ({ user }: any) => {
      const result = await SubDistrictController.get(user);
      return result;
    },
    {
      response: {
        200: SubDistrictModel.getResponse,
      },
    },
  )
  .post(
    "/",
    async ({ body, user }: any) => {
      const result = await SubDistrictController.create(body, user);
      return result;
    },
    {
      body: SubDistrictModel.createBody,
      response: {
        200: SubDistrictModel.createResponse,
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, user }: any) => {
      const result = await SubDistrictController.update(id, body, user);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: SubDistrictModel.updateBody,
      response: {
        200: SubDistrictModel.updateResponse,
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, user }: any) => {
      const result = await SubDistrictController.destroy(id, user);
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
  );

export default subDistrict;
