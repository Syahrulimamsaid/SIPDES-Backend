import { t, type UnwrapSchema } from "elysia";

export const CalendarModel = {
  getQuery: t.Optional(
    t.Object({
      type: t.Optional(t.String()),
      start: t.Optional(t.String()),
      end: t.Optional(t.String()),
    })
  ),
  calendarResponse: t.Object({
    id: t.String(),
    name: t.String(),
    date: t.String(),
    type: t.String(),
  }),
  getResponse: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      date: t.String(),
      type: t.String(),
    })
  ),
  createBody: t.Object({
    name: t.String(),
    date: t.String(),
    type: t.Union([t.Literal("h"), t.Literal("t"), t.Literal("off"), t.Literal("fm")]),
  }),
  createResponse: t.Object({
    id: t.String(),
    name: t.String(),
    date: t.String(),
    type: t.String(),
  }),
  updateBody: t.Object({
    name: t.Optional(t.String()),
    type: t.Optional(t.Union([t.Literal("h"), t.Literal("t"), t.Literal("off"), t.Literal("fm")])),
  }),
  updateResponse: t.Object({
    id: t.String(),
    name: t.String(),
    date: t.String(),
    type: t.String(),
  }),
} as const;

export type CalendarModel = {
  [k in keyof typeof CalendarModel]: UnwrapSchema<(typeof CalendarModel)[k]>;
};

