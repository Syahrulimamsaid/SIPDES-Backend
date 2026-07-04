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
  locationAccessByUserBody: t.Object({
    userId: t.String(),
  }),
  locationAccessUserResponse: t.Array(
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
    }),
  ),
  createAccessBody: t.Object({
    userId: t.String(),
    locationId: t.String(),
    description: t.Optional(t.Nullable(t.String())),
  }),
  createAccessResponse: t.Object({
    id: t.String(),
    userId: t.String(),
    locationId: t.String(),
    description: t.Nullable(t.String()),
  }),
  allAccessResponse: t.Array(
    t.Object({
      id: t.String(),
      fullname: t.String(),
      phone_number: t.String(),
      village: t.Optional(
        t.Nullable(
          t.Object({
            id: t.String(),
            name: t.String(),
            address: t.String(),
          }),
        ),
      ),
      location_access: t.Array(
        t.Object({
          id: t.String(),
          description: t.Nullable(t.String()),
          location: t.Object({
            id: t.String(),
            name: t.String(),
            lat: t.Number(),
            lng: t.Number(),
            radius: t.Number(),
            villageId: t.Nullable(t.String()),
          }),
        }),
      ),
    }),
  ),
  locationsResponse: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      lat: t.Number(),
      lng: t.Number(),
      radius: t.Number(),
      village: t.Object({
        id: t.String(),
        name: t.String(),
        address: t.String(),
      }),
    }),
  ),
  createLocationBody: t.Object({
    name: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    radius: t.Number(),
    villageId: t.String(),
  }),
  createLocationResponse: t.Object({
    id: t.String(),
    name: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    radius: t.Number(),
    villageId: t.String(),
  }),
  updateLocationBody: t.Object({
    name: t.Optional(t.String()),
    lat: t.Optional(t.Number()),
    lng: t.Optional(t.Number()),
    radius: t.Optional(t.Number()),
    villageId: t.Optional(t.String()),
  }),
  updateLocationResponse: t.Object({
    id: t.String(),
    name: t.String(),
    lat: t.Number(),
    lng: t.Number(),
    radius: t.Number(),
    villageId: t.String(),
  }),
} as const;
export type LocationModel = {
  [k in keyof typeof LocationModel]: UnwrapSchema<(typeof LocationModel)[k]>;
};
