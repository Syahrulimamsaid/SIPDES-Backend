import { t, type UnwrapSchema } from "elysia";

export const ReportModel = {
  getQuery: t.Object({
    start: t.String(),
    end: t.String(),
    userId: t.Optional(t.String()),
    village: t.Optional(t.String()),
    page: t.Optional(t.Numeric()),
    limit: t.Optional(t.Numeric()),
  }),
  getReportResponse: t.Array(
    t.Object({
      user: t.Object({
        id: t.String(),
        fullname: t.String(),
        phone_number: t.String(),
        role: t.String(), village: t.Nullable(
          t.Object({
            id: t.String(),
            name: t.String(),
            address: t.Nullable(t.String()),
          })
        ),
      }),
      jumlah_hadir_tepat_waktu: t.Number(),
      jumlah_terlambat: t.Number(),
      jumlah_cuti_izin: t.Number(),
      alpa: t.Number(),
      persentase_kehadiran: t.Number(),
      presence: t.Array(t.Object({
        id: t.String(),
        date: t.Date(),
        in: t.Nullable(t.Date()),
        out: t.Nullable(t.Date()),
        in_lat: t.Optional(t.Nullable(t.Number())),
        in_long: t.Optional(t.Nullable(t.Number())),
        out_lat: t.Optional(t.Nullable(t.Number())),
        out_long: t.Optional(t.Nullable(t.Number())),
        status: t.Union([
          t.Literal("hadir"),
          t.Literal("terlambat"),
          t.Literal("pulang"),
          t.Literal("alpa"),
          t.Literal("cuti"),
        ]),
        location_access: t.Object({
          id: t.String(),
          description: t.String(),
          location: t.Object({
            id: t.String(),
            name: t.String(),
          }),
        }),
      }))
    })
  ),
  meta: t.Optional(
    t.Object({
      page: t.Number(),
      limit: t.Number(),
      total: t.Number(),
      totalPages: t.Number(),
    })
  ),

} as const;

export type ReportModel = {
  [k in keyof typeof ReportModel]: UnwrapSchema<(typeof ReportModel)[k]>;
};
