import { t, type UnwrapSchema } from "elysia";

export const PresenceModel = {
  presenceGetSingleResponse: t.Object({
    id: t.String(),
    date: t.Date(),
    in: t.Nullable(t.Date()),
    out: t.Nullable(t.Date()),
    in_lat: t.Number(),
    in_long: t.Number(),
    out_lat: t.Nullable(t.Number()),
    out_long: t.Nullable(t.Number()),
    status: t.Union([
      t.Literal("hadir"),
      t.Literal("terlambat"),
      t.Literal("pulang"),
      t.Literal("alpa"),
      t.Literal("cuti"),
    ]),
    location_access: t.Object({
      id: t.String(),
      description: t.String(),
      location: t.Object({
        id: t.String(),
        name: t.String(),
      }),
    }),
  }),
  presenceGetResponse: t.Array(
    t.Object({
      id: t.String(),
      date: t.Date(),
      in: t.Nullable(t.Date()),
      out: t.Nullable(t.Date()),
      in_lat: t.Optional(t.Nullable(t.Number())),
      in_long: t.Optional(t.Nullable(t.Number())),
      out_lat: t.Optional(t.Nullable(t.Number())),
      out_long: t.Optional(t.Nullable(t.Number())),
      status: t.Union([
        t.Literal("hadir"),
        t.Literal("terlambat"),
        t.Literal("pulang"),
        t.Literal("alpa"),
        t.Literal("cuti"),
      ]),
      location_access: t.Object({
        id: t.String(),
        description: t.String(),
        location: t.Object({
          id: t.String(),
          name: t.String(),
        }),
      }),
      user: t.Optional(
        t.Object({
          id: t.String(),
          fullname: t.String(),
          phone_number: t.String(),
          village: t.Object({
            id: t.String(),
            name: t.String(),
          }),
        }),
      ),
    }),
  ),
  presenceQueue: t.Array(
    t.Object({
      userId: t.String(),
      created_at: t.Date(),
      lat: t.Number(),
      lng: t.Number(),
      type: t.Union([t.Literal("masuk"), t.Literal("pulang")]),
      status: t.Union([
        t.Literal("masuk"),
        t.Literal("hadir"),
        t.Literal("terlambat"),
        t.Literal("pulang"),
        t.Literal("alpa"),
        t.Literal("cuti"),
      ]),
      location_access: t.Object({
        id: t.String(),
        description: t.String(),
        location: t.Object({
          name: t.String(),
        }),
      }),
    }),
  ),
  presenceResponse: t.Object({
    userId: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    type: t.Union([t.Literal("masuk"), t.Literal("pulang")]),
    status: t.Union([
      t.Literal("hadir"),
      t.Literal("terlambat"),
      t.Literal("pulang"),
      t.Literal("alpa"),
      t.Literal("cuti"),
    ]),
    location_access: t.Object({
      id: t.String(),
      description: t.String(),
      location: t.Object({
        name: t.String(),
      }),
    }),
    created_at: t.Date(),
  }),
  getQuery: t.Object({
    periode: t.Date(),
    villageId: t.Optional(t.String()),
    status: t.Optional(
      t.Union([
        t.Literal("hadir"),
        t.Literal("terlambat"),
        t.Literal("pulang"),
        t.Literal("alpa"),
        t.Literal("cuti"),
      ]),
    ),
  }),
  updateBody: t.Object({
    id: t.String(),
    in: t.Nullable(t.Date()),
    out: t.Nullable(t.Date()),
    status: t.Optional(
      t.Union([
        t.Literal("hadir"),
        t.Literal("terlambat"),
        t.Literal("pulang"),
        t.Literal("alpa"),
        t.Literal("cuti"),
      ]),
    ),
  }),
  presenceBody: t.Object({
    lat: t.Number(),
    lng: t.Number(),
    locationAccessId: t.String(),
  }),
  presenceGetByIdBody: t.Object({
    id: t.String(),
  }),
} as const;
export type PresenceModel = {
  [k in keyof typeof PresenceModel]: UnwrapSchema<(typeof PresenceModel)[k]>;
};
