import { t, type UnwrapSchema } from "elysia";

export const LocationModel = {
  locationResponse: t.Array(
    t.Object({
      id: t.String(),
      description: t.String(),
      location: t.Object({
        id: t.String(),
        name: t.String(),
        lat: t.String(),
        lng: t.String(),
        radius: t.String(),
      }),
      presence: t.Object({
        status: t.String(),
        in: t.Nullable(t.String({ format: "date-time" })),
        out: t.Nullable(t.String({ format: "date-time" })),
      }),
    }),
  ),
  locationCheckBody: t.Object({
    lat: t.Number(),
    lng: t.Number(),
    locationId: t.String(),
  }),
  locationCheckResponse: t.Object({
    name: t.String(),
    location: t.String(),
    distance: t.String(),
    isInside: t.Boolean(),
  }),
} as const;
export type LocationModel = {
  [k in keyof typeof LocationModel]: UnwrapSchema<(typeof LocationModel)[k]>;
};
