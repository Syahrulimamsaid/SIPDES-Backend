import { Op } from "sequelize";
import { Calendar } from "../../models";
import dayjs from "dayjs";
import { ResponseError } from "../../response/response-error";
import { v4 as uuidv4 } from "uuid";

export class CalendarService {
  static async workDays(start: string, end: string) {
    const today = dayjs();
    const startDate = dayjs(start).startOf('days');
    const endDate = dayjs(end).endOf('days');

    if (!startDate.isValid() || !endDate.isValid()) throw ResponseError(400, "Format periode tidak valid. Gunakan format YYYY-MM atau YYYY-MM-DD.");

    let endOfCount = endDate;
    if (today.isBefore(endDate)) {
      if (today.isBefore(startDate)) {
        endOfCount = startDate.subtract(1, "day");
      } else {
        endOfCount = today;
      }
    }

    const totalHoliday = await Calendar.count({
      where: {
        date: {
          [Op.between]: [startDate.toDate(), endOfCount.toDate()],
        },
        type: "off",
      },
    });

    let workDays = 0;
    let currentDate = startDate;
    while (currentDate.isBefore(endOfCount) || currentDate.isSame(endOfCount, "day")) {
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workDays++;
      }
      currentDate = currentDate.add(1, "day");
    }

    return workDays - totalHoliday;
  }

  static async get(query: any) {
    const { type, start, end } = query || {};
    const where: any = {};
    if (type) {
      where.type = type;
    }
    if (start && end) {
      where.date = {
        [Op.between]: [start, end]
      };
    } else if (start) {
      where.date = {
        [Op.gte]: start
      };
    } else if (end) {
      where.date = {
        [Op.lte]: end
      };
    }
    const result = await Calendar.findAll({
      where,
      order: [["date", "ASC"]]
    });
    return result.map((item: any) => ({
      id: item.id,
      name: item.name,
      date: item.date,
      type: item.type
    }));
  }

  static async getById(id: string) {
    const calendar = await Calendar.findByPk(id);
    if (!calendar) {
      throw ResponseError(404, "Data kalender tidak ditemukan");
    }
    return {
      id: calendar.id,
      name: calendar.name,
      date: calendar.date,
      type: calendar.type
    };
  }

  static async create(body: any, user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const targetDate = dayjs(body.date);
    if (!targetDate.isValid()) {
      throw ResponseError(400, "Format tanggal tidak valid");
    }

    const dayOfWeek = targetDate.day();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw ResponseError(400, "Tidak dapat membuat event kalender pada hari libur (akhir pekan)");
    }

    const existingEvent = await Calendar.findOne({
      where: {
        date: body.date
      }
    });
    if (existingEvent) {
      throw ResponseError(400, "Event kalender pada tanggal ini sudah ada");
    }

    const existingHoliday = await Calendar.findOne({
      where: {
        date: body.date,
        type: "off"
      }
    });
    if (existingHoliday) {
      throw ResponseError(400, "Tidak dapat membuat event kalender pada hari libur nasional");
    }

    const id = uuidv4();
    const newCalendar = await Calendar.create({
      id,
      name: body.name,
      date: body.date,
      type: body.type
    });

    return {
      id: newCalendar.id,
      name: newCalendar.name,
      date: newCalendar.date,
      type: newCalendar.type
    };
  }

  static async update(id: string, body: any, user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const targetCalendar = await Calendar.findByPk(id);
    if (!targetCalendar) {
      throw ResponseError(404, "Data kalender tidak ditemukan");
    }

    if (body.date && body.date !== targetCalendar.date) {
      const targetDate = dayjs(body.date);
      if (!targetDate.isValid()) {
        throw ResponseError(400, "Format tanggal tidak valid");
      }

      const dayOfWeek = targetDate.day();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        throw ResponseError(400, "Tidak dapat mengubah tanggal ke hari libur (akhir pekan)");
      }

      const existingHoliday = await Calendar.findOne({
        where: {
          type: "off",
          id: { [Op.ne]: id }
        }
      });
      if (existingHoliday) {
        throw ResponseError(400, "Tidak dapat mengubah tanggal ke hari libur nasional");
      }
    }

    await targetCalendar.update({
      name: body.name,
      type: body.type
    });

    return {
      id: targetCalendar.id,
      name: targetCalendar.name,
      date: targetCalendar.date,
      type: targetCalendar.type
    };
  }

  static async destroy(id: string, user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const targetCalendar = await Calendar.findByPk(id);
    if (!targetCalendar) {
      throw ResponseError(404, "Data kalender tidak ditemukan");
    }

    await targetCalendar.destroy();
    return true;
  }
}

