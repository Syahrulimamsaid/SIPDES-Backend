import { t, type UnwrapSchema } from "elysia";

export const GlobalModel = {
  getQueryStatsPresence: t.Object({
    start: t.String(),
    end: t.String(),
  }),

  statsResponse: t.Object({
    user_total: t.Number(),
    location_total: t.Number(),
    village_name: t.String(),
  }),
  statsPresenceResponse: t.Object({
    presence_total: t.Number(),
    presence_user_total: t.Number(),
    hadir_total: t.Number(),
    user_terlambat_total: t.Number(),
    terlambat_total: t.Number(),
    cuti_total: t.Number(),
    belum_absen_total: t.Number(),
    alpha_total: t.Number(),
    presentase_hadir: t.Number(),
    presence_status: t.Array(
      t.Object({
        bulan: t.String(),
        tepat_waktu: t.Number(),
        terlambat: t.Number(),
      })
    ),
  }),
} as const;

export type GlobalModel = {
  [k in keyof typeof GlobalModel]: UnwrapSchema<(typeof GlobalModel)[k]>;
};
