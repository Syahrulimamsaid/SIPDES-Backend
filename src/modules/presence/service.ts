import type { PresenceModel } from "./model";
import { ResponseError } from "../../response/response-error";
import {
  Presence,
  Location,
  LocationAccess,
  Setting,
  User as Users,
  Village,
  Calendar,
} from "../../models/index";
import { Op, fn, col } from "sequelize";
import { getDistance } from "../../helpers/getDistance";
import { v4 as uuidv4 } from "uuid";
import redis from "../../config/redis";
import { User } from "../../interfaces/user.interface";
import dayjs from "dayjs";
import { Response } from "../../response/response";

export class PresenceService {
  static async get(query: PresenceModel["getQuery"], user: any) {
    const { periode, status, page, limit } = query;
    if (!periode) throw ResponseError(422, "Filtering periode is required");

    let period, villageId;
    period = dayjs(periode);
    if (!period) period = dayjs();

    if (user.role != "admin") villageId = user.villageId;

    const startOfMonth = period.startOf("month").format();
    const endOfMonth = period.endOf("month").format();

    const pageVal = Math.max(1, Number(page || 1));
    const limitVal = Math.max(1, Number(limit || 10));
    const offset = (pageVal - 1) * limitVal;

    const { count, rows: presence } = await Presence.findAndCountAll({
      distinct: true,
      attributes: [
        "id",
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
              where: {
                ...(villageId && {
                  villageId: villageId,
                }),
              },
            },
          ],
        },
        {
          model: Users,
          attributes: ["id", "fullname", "phone_number"],
          required: true,
          include: [
            {
              model: Village,
              attributes: ["id", "name"],
              required: true,
            },
          ],
        },
      ],
      where: {
        [Op.or]: [
          {
            in: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
          {
            out: {
              [Op.between]: [startOfMonth, endOfMonth],
            },
          },
        ],
        ...(status && {
          status: status,
        }),
      },
      order: [["createdAt", "desc"]],
      limit: limitVal,
      offset: offset,
    });

    const result = presence.map((data: any) => {
      return {
        id: data.id,
        date: data.get("date"),
        in: data.in,
        out: data.out,
        status: data.status ?? "",
        in_lat: Number(data.in_lat),
        in_long: Number(data.in_long),
        out_lat: Number(data.out_lat),
        out_long: Number(data.out_long),
        location_access: {
          id: data.LocationAccess?.id,
          description: data.LocationAccess?.description,
          location: {
            id: data.LocationAccess?.Location.id,
            name: data.LocationAccess?.Location.name,
          },
        },
        user: {
          id: data.User.id,
          fullname: data.User.fullname,
          phone_number: data.User.phone_number,
          village: { id: data.User.Village.id, name: data.User.Village.name },
        },
      };
    });
    return {
      data: result,
      meta: {
        page: pageVal,
        limit: limitVal,
        total: count,
        totalPages: Math.ceil(count / limitVal),
      },
    };
  }

  static async getByUser(periode: Date, user: User) {
    let period = dayjs(periode);
    if (!period.isValid()) period = dayjs();

    const startOfMonth = period.startOf("month");
    const endOfMonth = period.endOf("month");

    const presence = await Presence.findAll({
      attributes: [
        "id",
        [fn("DATE", fn("COALESCE", col("out"), col("in"))), "date"],
        "in",
        "out",
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
        },
      ],
      where: {
        userId: user.id,
        [Op.or]: [
          {
            in: {
              [Op.between]: [startOfMonth.format(), endOfMonth.format()],
            },
          },
          {
            out: {
              [Op.between]: [startOfMonth.format(), endOfMonth.format()],
            },
          },
        ],
      },
    });

    const calendars = await Calendar.findAll({
      where: {
        date: {
          [Op.between]: [startOfMonth.format("YYYY-MM-DD"), endOfMonth.format("YYYY-MM-DD")],
        },
      },
    });

    const calendarMap: Record<string, any> = {};
    calendars.forEach((c: any) => {
      calendarMap[c.date] = c;
    });

    const presenceMap: Record<string, any[]> = {};
    presence.forEach((p: any) => {
      const d = dayjs(p.get("date")).format("YYYY-MM-DD");
      if (!presenceMap[d]) {
        presenceMap[d] = [];
      }
      presenceMap[d].push(p);
    });

    const daysInMonth = period.daysInMonth();
    const result: any[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = period.date(day);
      const dateStr = currentDate.format("YYYY-MM-DD");

      const dayPresences = presenceMap[dateStr] || [];
      const calEvent = calendarMap[dateStr];

      if (dayPresences.length > 0) {
        dayPresences.forEach((p: any) => {
          result.push({
            id: p.id,
            date: currentDate.hour(12).toDate(),
            in: p.in,
            out: p.out,
            status: p.status ?? "",
            location_access: {
              id: p.LocationAccess?.id,
              description: p.LocationAccess?.description,
              location: {
                id: p.LocationAccess?.Location.id,
                name: p.LocationAccess?.Location.name,
              },
            },
            event: calEvent ? {
              name: calEvent.name,
              type: calEvent.type,
            } : null,
          });
        });
      } else {
        result.push({
          id: null,
          date: currentDate.hour(12).toDate(),
          in: null,
          out: null,
          status: calEvent ? (calEvent.type === "off" ? "libur" : calEvent.type === "t" ? "tugas" : calEvent.type === "h" ? "hadir" : "") : "",
          location_access: null,
          event: calEvent ? {
            name: calEvent.name,
            type: calEvent.type,
          } : null,
        });
      }
    }

    return result;
  }

  static async getById(id: string, user: User) {
    const presence = await Presence.findOne({
      attributes: [
        "id",
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
        },
      ],
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!presence || presence == null) {
      throw ResponseError(404, "Data not found");
    }

    return {
      id: presence.id,
      date: presence.get("date"),
      in: presence.in,
      out: presence.out,
      in_lat: Number(presence.in_lat),
      in_long: Number(presence.in_long),
      out_lat: Number(presence.out_lat),
      out_long: Number(presence.out_long),
      status: presence.status ?? "",
      location_access: {
        id: presence.LocationAccess?.id,
        description: presence.LocationAccess?.description,
        location: {
          id: presence.LocationAccess?.Location.id,
          name: presence.LocationAccess?.Location.name,
        },
      },
    };
  }

  private static async getQueue(user: any) {
    const result = await redis.lrange(`presence:${user.id}`, 0, -1);

    if (!result || result == null || result.length === 0) {
      return [];
    }

    const data = result
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      })
      .filter((item) => item !== null);

    return data;
  }

  static async getByQueue(user: User) {
    const data = await this.getQueue(user);
    return data;
  }

  static async presenceQueue(body: PresenceModel["presenceBody"], user: User) {
    const todayStr = dayjs().format("YYYY-MM-DD");
    const holiday = await Calendar.findOne({
      where: {
        date: todayStr,
        type: "off",
      },
    });

    if (holiday) {
      throw ResponseError(400, "Tidak dapat melakukan presensi pada hari libur nasional");
    }

    const location = await LocationAccess.findOne({
      where: { userId: user.id, id: body.locationAccessId },
      include: [
        {
          model: Location,
          attributes: ["name", "lat", "lng", "radius"],
          required: true,
        },
      ],
    });

    if (!location) {
      throw ResponseError(404, "Location not found");
    }

    const distance = getDistance(
      body.lat,
      body.lng,
      Number(location.Location?.lat),
      Number(location.Location?.lng),
    );

    if (distance > Number(location.radius)) {
      throw ResponseError(403, "Location out of radius");
    }

    const limitTime = await Setting.findOne({
      attributes: ["in_time", "out_time"],
    });

    const payload = {
      userId: user.id,
      lat: body.lat,
      lng: body.lng,
      location_access: {
        id: location.id,
        description: location.description,
        location: {
          name: location.Location?.name,
        },
      },
      type: "masuk",
      status: "masuk",
      created_at: new Date(),
    };

    const today = new Date();
    const now = today.toTimeString().split(" ")[0];
    const startOfDay = today.setHours(0, 0, 0, 0);
    const endOfDay = today.setHours(23, 59, 59, 999);

    const existing = await Presence.findOne({
      where: {
        userId: user.id,
        locationAccessId: body.locationAccessId,
        in: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    var existingQueue;
    if (!existing) {
      const queue = await PresenceService.getQueue(user);

      existingQueue = queue.find((a: any) => {
        return a?.location_access?.id === location.id;
      });
    }

    if (
      (existing && existing.out) ||
      (existingQueue &&
        (existingQueue.status == "hadir" || existingQueue.status == "pulang"))
    ) {
      throw ResponseError(400, "Presensi hari ini sudah lengkap");
    }

    if (
      !existing &&
      !existingQueue &&
      now > limitTime.in_time &&
      now < limitTime.out_time
    ) {
      payload.status = "terlambat";
    } else {
      if (now < limitTime.out_time) {
        throw ResponseError(400, "Presensi pulang belum bisa dilakukan");
      }

      if (
        (existing && !existing.out) ||
        (existingQueue &&
          (existingQueue.status == "masuk" ||
            existingQueue.status == "terlambat"))
      ) {
        payload.status = "hadir";
      }

      if (!existing && !existingQueue) {
        payload.status = "pulang";
      }

      payload.type = "pulang";
    }

    await redis.lpush(`presence:${user.id}`, JSON.stringify(payload));
    await redis.lpush("presence", user.id);
    return payload;
  }

  static async presence(data: any) {
    if (data.status == "hadir") {
      const startOfDay = new Date().setHours(0, 0, 0, 0);
      const endOfDay = new Date().setHours(23, 59, 59, 999);

      await Presence.update(
        {
          out: data.created_at,
          out_lat: data.lat,
          out_long: data.lng,
          status: data.status,
        },
        {
          where: {
            userId: data.userId,
            locationAccessId: data.location_access.id,
            in: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        },
      );
    }

    if (data.status == "terlambat") {
      await Presence.create({
        id: uuidv4(),
        userId: data.userId,
        locationAccessId: data.location_access.id,
        status: data.status,
        in: data.created_at,
        in_lat: data.lat,
        in_long: data.lng,
      });
    }

    if (data.status == "pulang") {
      await Presence.create({
        id: uuidv4(),
        userId: data.userId,
        locationAccessId: data.location_access.id,
        status: data.status,
        out: data.created_at,
        out_lat: data.lat,
        out_long: data.lng,
      });
    }

    return true;
  }

  static async update(body: PresenceModel["updateBody"], user: any) {
    let userId, villageId;
    if (user.role == "umum") userId = user.id;
    if (user.role != "admin") villageId = user.villageId;

    if (body.in && body.out && body.in > body.out)
      throw Response(400, "Waktu pulang harus lebih besar daripada waktu masuk");

    const cek = await Presence.findOne({
      include: [
        {
          model: LocationAccess,
          required: true,
          include: [
            {
              model: Location,
              required: true,
              where: {
                ...(villageId && {
                  villageId: villageId,
                }),
              },
            },
          ],
        },
      ],
      where: {
        id: body.id,
        ...(userId && {
          userId: userId,
        }),
      },
    });

    if (!cek || cek == null) throw Response(404, "Data not found");

    await Presence.update(
      {
        in: body.in,
        out: body.out,
        status: body.status,
      },
      {
        where: {
          id: body.id,
          ...(userId && {
            userId: userId,
          }),
        },
        force: true,
      },
    );

    return true;
  }

  static async destroy(id: string, user: any) {
    let userId, villageId;
    if (user.role == "umum") userId = user.id;
    if (user.role != "admin") villageId = user.villageId;

    await Presence.destroy({
      include: [
        {
          model: LocationAccess,
          required: true,
          include: [
            {
              model: Location,
              required: true,
              where: {
                ...(villageId && {
                  villageId: villageId,
                }),
              },
            },
          ],
        },
      ],
      where: {
        id: id,
        ...(userId && {
          userId: userId,
        }),
      },
      force: true,
    });

    return true;
  }

  static async create(body: PresenceModel["createBody"], user: any) {
    const targetUser = await Users.findOne({ where: { id: body.userId } });
    if (!targetUser) throw ResponseError(404, "User tidak ditemukan");


    if (user.role !== "admin") {
      if (targetUser.villageId !== user.villageId) throw ResponseError(403, "Akses ditolak. Desa user tidak sama dengan desa operator.");
    }

    const locationAccess = await LocationAccess.findOne({
      include: [
        {
          model: Location,
          required: true,
        },
      ],
      where: { userId: body.userId, id: body.locationAccessId },
    });

    if (!locationAccess) throw ResponseError(404, "Location access not found");


    if (!body.in && !body.out) throw ResponseError(422, "Waktu tidak boleh kosong semua");

    let date = body.in || body.out;
    const startOfDay = dayjs(date).startOf('day').toISOString();
    const endOfDay = dayjs(date).endOf('day').toISOString();

    const existing = await Presence.findOne({
      where: {
        userId: body.userId,
        locationAccessId: body.locationAccessId,
        [Op.or]: [
          {
            in: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
          {
            out: {
              [Op.between]: [startOfDay, endOfDay],
            },
          }
        ],
      },
    });

    if (existing) throw ResponseError(404, "Data already exist");

    const presence = await Presence.create({
      id: uuidv4(),
      userId: body.userId,
      locationAccessId: body.locationAccessId,
      in: body.in,
      out: body.out,
      in_lat: locationAccess.Location.lat,
      in_long: locationAccess.Location.long,
      out_lat: locationAccess.Location.lat,
      out_long: locationAccess.Location.long,
      status: body.status,
    });

    return presence;
  }
}
