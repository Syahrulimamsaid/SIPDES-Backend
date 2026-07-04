import { t, type UnwrapSchema } from "elysia";

export const SubDistrictModel = {
  getResponse: t.Array(
    t.Object({
      id: t.String(),
      name: t.String(),
      villages: t.Array(
        t.Object({
          id: t.String(),
          name: t.String(),
        }),
      ),
    }),
  ),
  createBody: t.Object({
    name: t.String(),
  }),
  createResponse: t.Object({
    id: t.String(),
    name: t.String(),
  }),
  updateBody: t.Object({
    name: t.String(),
  }),
  updateResponse: t.Object({
    id: t.String(),
    name: t.String(),
  }),
} as const;

export type SubDistrictModel = {
  [k in keyof typeof SubDistrictModel]: UnwrapSchema<(typeof SubDistrictModel)[k]>;
};
