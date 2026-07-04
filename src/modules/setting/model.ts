import { t, type UnwrapSchema } from "elysia";

export const SettingModel = {
  updateBody: t.Object({
    in_time: t.String({
      pattern: "^([01]\\d|2[0-3]):([0-5]\\d)(:[0-5]\\d)?$",
    }),
    out_time: t.String({
      pattern: "^([01]\\d|2[0-3]):([0-5]\\d)(:[0-5]\\d)?$",
    }),
  }),

  updateResponse: t.Object({
    in_time: t.String(),
    out_time: t.String(),
  }),
} as const;

export type SettingModel = {
  [k in keyof typeof SettingModel]: UnwrapSchema<(typeof SettingModel)[k]>;
};
