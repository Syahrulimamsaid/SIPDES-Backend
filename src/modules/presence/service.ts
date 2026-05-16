import type { PresenceModel } from "./model";
import { ResponseError } from "../../response/response-error";
import {
  Presence,
  Location,
  LocationAccess,
  Setting,
} from "../../models/index";
import { Op, fn, col } from "sequelize";
import { getDistance } from "../../helpers/getDistance";
import { v4 as uuidv4 } from "uuid";
import { redis } from "../../config/redis";
import { Response } from "../../response/response";

export class PresenceService {
  static async get(user: any) {
    const startOfDay = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1,
    );
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

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
            in: null,
          },
          {
            in: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        ],
        [Op.or]: [
          {
            out: null,
          },
          {
            out: {
              [Op.between]: [startOfDay, endOfDay],
            },
          },
        ],
      },
    });

    const result = presence.map((data: any) => {
      return {
        id: data.id,
        date: data.get("date"),
        in: data.in,
        out: data.out,
        status: data.status ?? "",
        location_access: {
          id: data.LocationAccess?.id,
          description: data.LocationAccess?.description,
          location: {
            id: data.LocationAccess?.Location.id,
            name: data.LocationAccess?.Location.name,
          },
        },
      };
    });
    return result;
  }

  static async getById(id: string, user: any) {
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

  static async getByQueue(user: any) {
    const result = await redis.lrange("presence", 0, -1);

    if (!result || result === null) {
      throw ResponseError(404, "Data not found");
    }

    const data = result
      .map((item) => {
        try {
          return JSON.parse(item);
        } catch {
          return null;
        }
      })
      .filter((item) => item && item.userId === user.id);

    if (!data || data.length == 0) {
      throw ResponseError(404, "Data not found");
    }
    return data;
  }

  static async presenceQueue(body: PresenceModel["presenceBody"], user: any) {
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

    if (existing && existing.out) {
      throw ResponseError(400, "Presensi hari ini sudah lengkap");
    }

    if (!existing && now > limitTime.in_time && now < limitTime.out_time) {
      payload.status = "terlambat";
    } else {
      if (now < limitTime.out_time) {
        throw ResponseError(400, "Presensi pulang belum bisa dilakukan");
      }

      if (existing && !existing.out) {
        payload.status = "hadir";
      }

      if (!existing) {
        payload.status = "pulang";
      }

      payload.type = "pulang";
    }

    await redis.lpush("presence", JSON.stringify(payload));
    return Response(202, "Presence Queue");
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
}
