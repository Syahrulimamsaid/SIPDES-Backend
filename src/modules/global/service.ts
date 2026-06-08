import dayjs from "dayjs";
import { User, Location, Village, Presence } from "../../models/index";
import { Op } from "sequelize";

export class GlobalService {
  static async getStats(user: any) {
    let userWhere: any = {};
    let locationWhere: any = {};
    const start = dayjs().startOf('day').toDate();
    const end = dayjs().endOf('day').toDate();

    if (user.role !== "admin") {
      userWhere.villageId = user.villageId;
      userWhere.role = { [Op.in]: ["umum"] };
      locationWhere.villageId = user.villageId;
    }

    const [totalUsers, totalLocations, village] = await Promise.all([
      User.count({ where: userWhere }),
      Location.count({ where: locationWhere }),
      Village.findOne({ where: { id: user.villageId } }),

    ]);

    return {
      user_total: totalUsers,
      location_total: totalLocations,
      village_name: village.name,
    };
  }

  static async getStatsPresence(user: any) {
    let userWhere: any = {};
    const start = dayjs().startOf('day').toDate();
    const end = dayjs().endOf('day').toDate();

    if (user.role !== "admin") {
      userWhere.villageId = user.villageId;
      userWhere.role = { [Op.in]: ["umum"] };
    }

    const startOfYear = dayjs().startOf('year').toDate();
    const endOfYear = dayjs().endOf('year').toDate();

    const [totalUsers, presences, yearlyPresences] = await Promise.all([
      User.count({ where: userWhere }),
      Presence.findAll({
        where: {
          [Op.or]: [
            {
              in: {
                [Op.between]: [start, end],
              },
            },
            {
              out: {
                [Op.between]: [start, end],
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

    const presentUserIds = new Set<string>();
    const onTimeUserIds = new Set<string>();
    const lateUserIds = new Set<string>();

    for (const p of presences) {
      const uId = p.userId;
      presentUserIds.add(uId);
      if (p.status === "terlambat") {
        lateUserIds.add(uId);
      } else if (p.status === "hadir" || p.status === "pulang") {
        onTimeUserIds.add(uId);
      }
    }

    for (const uId of lateUserIds) {
      onTimeUserIds.delete(uId);
    }

    const presence_total = presences.length;
    const presence_user_total = presentUserIds.size;
    const hadir_total = onTimeUserIds.size;
    const terlambat_total = lateUserIds.size;
    const belum_absen_total = Math.max(0, totalUsers - presence_user_total);

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
        if (p.status === "terlambat") {
          presence_status[monthIndex].terlambat++;
        } else if (p.status === "hadir" || p.status === "pulang") {
          presence_status[monthIndex].tepat_waktu++;
        }
      }
    }

    return {
      presence_total,
      presence_user_total,
      hadir_total,
      terlambat_total,
      belum_absen_total,
      presence_status,
    };
  }
}
