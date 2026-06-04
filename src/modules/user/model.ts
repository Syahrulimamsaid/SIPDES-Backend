import { t, type UnwrapSchema } from "elysia";

export const UserModel = {
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

export type UserModel = {
  [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};
