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
  createBody: t.Object({
    phone_number: t.String({ minLength: 10, maxLength: 15 }),
    password: t.String({ minLength: 6 }),
    fullname: t.String(),
    role: t.Union([t.Literal("admin"), t.Literal("operator"), t.Literal("umum")]),
    villageId: t.Optional(t.Nullable(t.String())),
  }),
  createResponse: t.Object({
    id: t.String(),
    phone_number: t.String(),
    fullname: t.String(),
    role: t.String(),
    villageId: t.Nullable(t.String()),
  }),
  updateBody: t.Object({
    phone_number: t.Optional(t.String({ minLength: 10, maxLength: 15 })),
    password: t.Optional(t.String({ minLength: 6 })),
    fullname: t.Optional(t.String()),
    role: t.Optional(t.Union([t.Literal("admin"), t.Literal("operator"), t.Literal("umum")])),
    villageId: t.Optional(t.Nullable(t.String())),
  }),
  updateResponse: t.Object({
    id: t.String(),
    phone_number: t.String(),
    fullname: t.String(),
    role: t.String(),
    villageId: t.Nullable(t.String()),
  }),
} as const;

export type UserModel = {
  [k in keyof typeof UserModel]: UnwrapSchema<(typeof UserModel)[k]>;
};
