import { t, type UnwrapSchema } from "elysia";

export const PresenceModel = {
  presenceResponse: t.Object({
    type: t.Union([t.Literal("IN"), t.Literal("OUT")]),

    data: t.Object({
      id: t.String(),
      userId: t.String(),
      locationId: t.String(),
      in: t.Nullable(t.String()),
      out: t.Nullable(t.String()),
      in_lat: t.Number(),
      in_long: t.Number(),
      out_lat: t.Nullable(t.Number()),
      out_long: t.Nullable(t.Number()),
      status: t.Union([
        t.Literal("hadir"),
        t.Literal("terlambat"),
        t.Literal("alpa"),
        t.Literal("cuti"),
      ]),
    }),
  }),
  presenceBody: t.Object({
    lat: t.Number(),
    lng: t.Number(),
    locationId: t.String(),
  }),
} as const;
export type PresenceModel = {
  [k in keyof typeof PresenceModel]: UnwrapSchema<(typeof PresenceModel)[k]>;
};
