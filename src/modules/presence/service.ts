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
      out_long: Number(presence.out_long) ,
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

  static async presence(body: PresenceModel["presenceBody"], user: any) {
    const location = await LocationAccess.findAll({
      where: { userId: user.id },
      include: [
        {
          model: Location,
          attributes: ["lat", "lng", "radius"],
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

    const normalizePresence = (data: any) => ({
      id: String(data.id),
      userId: String(data.userId),
      locationAccessId: String(data.locationAccessId),

      in: data.in ? new Date(data.in).toISOString() : null,
      out: data.out ? new Date(data.out).toISOString() : null,

      in_lat: Number(data.in_lat),
      in_long: Number(data.in_long),
      out_lat: data.out_lat ? Number(data.out_lat) : null,
      out_long: data.out_long ? Number(data.out_long) : null,

      status: data.status,
    });

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

    if (!existing && now < limitTime.out_time) {
      var status = "masuk";

      if (now > limitTime.in_time && now < limitTime.out_time) {
        status = "terlambat";
      }

      const presence = await Presence.create({
        id: uuidv4(),
        userId: user.id,
        locationAccessId: body.locationAccessId,
        in: new Date(),
        in_lat: body.lat,
        in_long: body.lng,
        status: status,
      });

      return {
        type: "IN",
        data: normalizePresence(presence),
      };
    }

    if (existing && !existing.out) {
      if (now < limitTime.out_time) {
        throw ResponseError(400, "Presensi pulang belum bisa dilakukan");
      }

      existing.out = new Date();
      existing.out_lat = body.lat;
      existing.out_long = body.lng;

      await existing.save();

      return {
        type: "OUT",
        data: normalizePresence(existing),
      };
    }
    if (!existing) {
      if (now < limitTime.out_time) {
        throw ResponseError(400, "Presensi pulang belum bisa dilakukan");
      }
      const presence = await Presence.create({
        id: uuidv4(),
        userId: user.id,
        locationAccessId: body.locationAccessId,
        out: new Date(),
        out_lat: body.lat,
        out_long: body.lng,
        status: "pulang",
      });

      return {
        type: "OUT",
        data: normalizePresence(presence),
      };
    }

    throw ResponseError(400, "Presensi hari ini sudah lengkap");
  }
}
