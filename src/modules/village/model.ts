import { t, type UnwrapSchema } from "elysia";

export const VillageModel = {
  getResponse: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      address: t.String(),
      subDistrict: t.Object({
        id: t.String(),
        name: t.String(),
      }),
      user_count: t.Number(),
      location_count: t.Number(),
    }),
  ),
  createBody: t.Object({
    name: t.String(),
    address: t.String(),
    subDistrictId: t.String(),
  }),
  createResponse: t.Object({
    id: t.String(),
    name: t.String(),
    address: t.String(),
    subDistrictId: t.String(),
  }),
  updateBody: t.Object({
    name: t.Optional(t.String()),
    address: t.Optional(t.String()),
    subDistrictId: t.Optional(t.Nullable(t.String())),
  }),
  updateResponse: t.Object({
    id: t.String(),
    name: t.String(),
    address: t.String(),
    subDistrictId: t.Nullable(t.String()),
  }),
} as const;

export type VillageModel = {
  [k in keyof typeof VillageModel]: UnwrapSchema<(typeof VillageModel)[k]>;
};
