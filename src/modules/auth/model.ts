import { t, type UnwrapSchema } from "elysia";

export const AuthModel = {
  signInBody: t.Object({
    phone_number: t.String(),
    password: t.String(),
    device: t.String(),
  }),
  signInResponse: t.Object({
    id: t.String(),
    phone_number: t.String(),
    fullname: t.String(),
    role: t.String(),
    token: t.String(),
    village: t.Object({
      id: t.String(),
      name: t.String(),
      address: t.String(),
    }),
  }),
  signCheckResponse: t.Object({
    status: t.Boolean(),
    user: t.Optional(t.Any()),
    message: t.Optional(t.String()),
  }),

  changePassBody: t.Object({
    old_password: t.String(),
    new_password: t.String(),
    confirm_password: t.String(),
  }),
  signInInvalid: t.Literal("Invalid phone number or password"),
} as const;

export type AuthModel = {
  [k in keyof typeof AuthModel]: UnwrapSchema<(typeof AuthModel)[k]>;
};
