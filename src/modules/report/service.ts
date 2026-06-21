import { User, Village, Presence, Calendar, LocationAccess, Location } from "../../models/index";
import { ResponseError } from "../../response/response-error";
import { Op, fn, col } from "sequelize";
import dayjs from "dayjs";
import type { ReportModel } from "./model";
import { CalendarController } from "../calendar/controller";

export class ReportService {
  static async getPresenceReport(query: ReportModel["getQuery"], user: any) {
    const { start, end, userId, village, page, limit } = query;
   
    if (!user || (user.role !== "admin" && user.role !== "operator")) throw ResponseError(403, "Akses ditolak");
    if (!start || !end) throw ResponseError(422, "Filtering periode is required");

    const startDate = dayjs(start).startOf('days');
    const endDate = dayjs(end).endOf('days');
    
    const calendarController = new CalendarController();
    const workDays = await calendarController.workDays(start, end);

    // Build user where clause
    const whereUser: any = { role: "umum" };

    if (user.role === "operator") {
      whereUser.villageId = user.villageId;
    } else if (user.role === "admin") {
      if (village) whereUser.villageId = village;
    }

    if (userId) whereUser.id = userId;

    const pageVal = page ? Math.max(1, Number(page)) : null;
    const limitVal = limit ? Math.max(1, Number(limit)) : null;
    const offset = pageVal && limitVal ? (pageVal - 1) * limitVal : null;

    const { rows: users } = await User.findAndCountAll({
      where: whereUser,
      include: [
        {
          model: Village,
          attributes: ["id", "name", "address"],
          required: false,
        },
      ],
      ...(limitVal !== null && { limit: limitVal }),
      ...(offset !== null && { offset: offset }),
      order: [["fullname", "ASC"]],
    });

    const userIds = users.map((u: any) => u.id);

    const presences = userIds.length > 0 ? await Presence.findAll({
      attributes: [
        "id",
        "userId",
        [fn("DATE", fn("COALESCE", col("out"), col("in"))), "date"],
        "in",
        "out",
        "in_lat",
        "in_long",
        "out_lat",
        "out_long",
        "status",
      ],
      include: [
        {
          model: LocationAccess,
          attributes: ["id", "description"],
          required: true,
          include: [
            {
              model: Location,
              attributes: ["id", "name"],
              required: true,
            },
          ],
        }],
      where: {
        userId: {
          [Op.in]: userIds,
        },
        [Op.or]: [
          {
            in: {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            },
          },
          {
            out: {
              [Op.between]: [startDate.toDate(), endDate.toDate()],
            },
          },
        ],
      },
    }) : [];

    const data = users.map((u: any) => {
      const userPresences = presences.filter((p: any) => p.userId === u.id);

      const hadirCount = userPresences.filter((p: any) => p.status === "hadir").length;
      const terlambatCount = userPresences.filter((p: any) => p.status === "terlambat" || p.status === 'pulang').length;
      const cutiCount = userPresences.filter((p: any) => p.status === "cuti").length;
      const alpaCount = Math.max(0, workDays - (hadirCount + terlambatCount + cutiCount));

      const persentaseKehadiran = workDays > 0
        ? Number((((hadirCount + terlambatCount) / workDays) * 100).toFixed(2))
        : 0;
      
      return {
        user: {
          id: u.id,
          fullname: u.fullname,
          phone_number: u.phone_number,
          role: u.role,
          village: u.Village ? {
            id: u.Village.id,
            name: u.Village.name,
            address: u.Village.address,
          } : null,
        },
        jumlah_hadir_tepat_waktu: hadirCount,
        jumlah_terlambat: terlambatCount,
        jumlah_cuti_izin: cutiCount,
        alpa: alpaCount,
        persentase_kehadiran: persentaseKehadiran,
        presence: userPresences.map((p: any) => ({
          id: p.id,
          date: p.get("date"),
          in: p.in,
          out: p.out,
          in_lat: Number(p.in_lat),
          in_long: Number(p.in_long),
          out_lat: Number(p.out_lat),
          out_long: Number(p.out_long),
          status: p.status,
          location_access: {
            id: p.LocationAccess?.id,
            description: p.LocationAccess?.description,
            location: {
              id: p.LocationAccess?.Location.id,
              name: p.LocationAccess?.Location.name,
            },
          },
        }))
      };
    });

    return data;
  }
}