import { Elysia, t } from "elysia";
import { CalendarModel } from "./model";
import { CalendarController } from "./controller";

const calendar = new Elysia({ prefix: "/calendar" });
calendar
  .get(
    "/",
    async ({ query }) => {
      const result = await CalendarController.get(query);
      return result;
    },
    {
      query: CalendarModel.getQuery,
      response: {
        200: CalendarModel.getResponse,
      },
    },
  )
  .get(
    "/:id",
    async ({ params: { id } }) => {
      const result = await CalendarController.getById(id);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      response: {
        200: CalendarModel.calendarResponse,
      },
    },
  )
  .post(
    "/",
    async ({ body, user }: any) => {
      const result = await CalendarController.create(body, user);
      return result;
    },
    {
      body: CalendarModel.createBody,
      response: {
        200: CalendarModel.createResponse,
      },
    },
  )
  .patch(
    "/:id",
    async ({ params: { id }, body, user }: any) => {
      const result = await CalendarController.update(id, body, user);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: CalendarModel.updateBody,
      response: {
        200: CalendarModel.updateResponse,
      },
    },
  )
  .delete(
    "/:id",
    async ({ params: { id }, user }: any) => {
      const result = await CalendarController.destroy(id, user);
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

export default calendar;

