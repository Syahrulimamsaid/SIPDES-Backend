import { t, type UnwrapSchema } from "elysia";

export const VillageModel = {
  getResponse: t.Array(
    t.Object({
      id: t.String(),
      phone_number: t.String(),
      fullname: t.String(),
      role: t.String(),
      village: t.Optional(
        t.Object({
          id: t.String(),
          name: t.String(),
          address: t.String(),
        }),
      ),
    }),
  ),
} as const;

export type VillageModel = {
  [k in keyof typeof VillageModel]: UnwrapSchema<(typeof VillageModel)[k]>;
};
