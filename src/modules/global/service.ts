import dayjs from "dayjs";
import { User, Location, Village, Presence } from "../../models/index";
import { Op } from "sequelize";
import { CalendarController } from "../calendar/controller";
import { GlobalModel } from "./model";
import { ResponseError } from "../../response/response-error";

export class GlobalService {
  static async getStats(user: any) {
    let userWhere: any = {};
    let locationWhere: any = {};

    if (user.role !== "admin") {
      userWhere.villageId = user.villageId;
      userWhere.role = { [Op.in]: ["umum"] };
      locationWhere.villageId = user.villageId;
    }

    const [totalUsers, totalLocations, village, totalVillages] = await Promise.all([
      User.count({ where: userWhere }),
      Location.count({ where: locationWhere }),
      Village.findOne({ where: { id: user.villageId } }),
      Village.count(),
    ]);

    return {
      user_total: totalUsers,
      location_total: totalLocations,
      village_name: village?.name || "-",
      village_total: totalVillages
    };
  }

  static async getStatsPresence(query: GlobalModel["getQueryStatsPresence"], user: any) {
    const { start, end } = query;

    let startDate, endDate;
    let userWhere: any = {};

    if (!start || !end) {
      startDate = dayjs().startOf('days');
      endDate = dayjs().endOf('days');
    } else {
      startDate = dayjs(start).startOf('days');
      endDate = dayjs(end).endOf('days');
    }

    if (!startDate.isValid() || !endDate.isValid()) throw ResponseError(400, "Format periode tidak valid. Gunakan format YYYY-MM atau YYYY-MM-DD.");

    if (user.role !== "admin") {
      userWhere.villageId = user.villageId;
      userWhere.role = { [Op.in]: ["umum"] };
    }

    const startOfYear = dayjs().startOf('year').toDate();
    const endOfYear = dayjs().endOf('year').toDate();

    const calendarController = new CalendarController();
    const workDays = await calendarController.workDays(start, end);

    const [totalUsers, presences, yearlyPresences] = await Promise.all([
      User.count({ where: userWhere }),
      Presence.findAll({
        where: {
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
        include: [{
          model: User,
          required: true,
          where: userWhere
        }],
      }),
      Presence.findAll({
        attributes: ["in", "out", "status"],
        where: {
          [Op.or]: [
            {
              in: {
                [Op.between]: [startOfYear, endOfYear],
              },
            },
            {
              out: {
                [Op.between]: [startOfYear, endOfYear],
              },
            },
          ],
        },
        include: [{
          model: User,
          required: true,
          where: userWhere
        }],
      })
    ]);

    const users = await User.findAll({
      attributes: ['id'],
      where: userWhere
    });

    const presentUserIds = new Set<string>();
    const onTimeUserIds = new Set<string>();
    const lateUserIds = new Set<string>();
    const cuti = new Set<string>();
    const noKet = new Set<string>();
    let terlambat_total = 0, hadir = 0;

    for (const p of presences) {
      const uId = p.userId;
      presentUserIds.add(uId);

      if (p.status == "terlambat" || p.status == "pulang") {
        lateUserIds.add(uId);
        terlambat_total++;
      } else if (p.status == "hadir") {
        onTimeUserIds.add(uId);
        hadir++;
      } else if (p.status == "cuti") {
        cuti.add(uId)
      } else {
        noKet.add(uId);
      }
    }

    const presence_total = presences.length;
    const presence_user_total = presentUserIds.size;
    const hadir_total = onTimeUserIds.size;
    const user_terlambat_total = lateUserIds.size;
    const cuti_total = cuti.size;
    const belum_absen_total = Math.max(0, totalUsers - presence_user_total);
    const presentase_hadir =  workDays > 0
        ? Number((((hadir + terlambat_total) / workDays) * 100).toFixed(2))
        : 0;
 
    let alpha_total = 0;
    users.forEach((data: any) => {
      const presence = presences.filter((p: any) => p.userId === data.id);
      const hadir = presence.filter((p: any) => p.status === "hadir");
      const terlambat = presence.filter((p: any) => p.status === "terlambat" || p.status === "pulang");
      const cuti = presence.filter((p: any) => p.status === "cuti");

      alpha_total += Math.max(0, workDays - (hadir.length + terlambat.length + cuti.length));
    });

    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const presence_status = Array.from({ length: 12 }, (_, i) => ({
      bulan: monthNames[i],
      tepat_waktu: 0,
      terlambat: 0,
    }));

    for (const p of yearlyPresences) {
      const date = p.in || p.out;
      if (!date) continue;
      const monthIndex = dayjs(date).month();
      if (monthIndex >= 0 && monthIndex < 12) {
        if (p.status === "terlambat" || p.status === "pulang") {
          presence_status[monthIndex].terlambat++;
        } else if (p.status === "hadir") {
          presence_status[monthIndex].tepat_waktu++;
        }
      }
    }

    return {
      presence_total,
      presence_user_total,
      hadir_total,
      user_terlambat_total,
      terlambat_total,
      cuti_total,
      belum_absen_total,
      alpha_total,
      presentase_hadir,
      presence_status,
    };
  }
}
