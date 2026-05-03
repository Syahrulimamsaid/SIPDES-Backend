import type { PresenceModel } from "./model";
import { ResponseError } from "../../response/response-error";
import { Presence, Location } from "../../models/index";
import { Op } from "sequelize";
import { getDistance } from "../../helpers/getDistance";
import { v4 as uuidv4 } from "uuid";

export class PresenceService {
  static async presence(body: PresenceModel["presenceBody"], user: any) {
    const location = await Location.findOne({
      where: { id: body.locationId },
    });

    if (!location) {
      throw ResponseError(404, "Location not found");
    }

    const distance = getDistance(
      body.lat,
      body.lng,
      Number(location.lat),
      Number(location.lng),
    );

    if (distance > Number(location.radius)) {
      throw ResponseError(403, "Location out of radius");
    }

    const normalizePresence = (data: any) => ({
      id: String(data.id),
      userId: String(data.userId),
      locationId: String(data.locationId),

      in: data.in ? new Date(data.in).toISOString() : null,
      out: data.out ? new Date(data.out).toISOString() : null,

      in_lat: Number(data.in_lat),
      in_long: Number(data.in_long),
      out_lat: data.out_lat ? Number(data.out_lat) : null,
      out_long: data.out_long ? Number(data.out_long) : null,

      status: data.status,
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existing = await Presence.findOne({
      where: {
        userId: user.id,
        locationId: body.locationId,
        in: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    if (!existing) {
      const presence = await Presence.create({
        id: uuidv4(),
        userId: user.id,
        locationId: body.locationId,
        in: new Date(),
        in_lat: body.lat,
        in_long: body.lng,
        status: "hadir",
      });

      return {
        type: "IN",
        data: normalizePresence(presence),
      };
    }

    if (!existing.out) {
      existing.out = new Date();
      existing.out_lat = body.lat;
      existing.out_long = body.lng;

      await existing.save();

      return {
        type: "OUT",
        data: normalizePresence(existing),
      };
    }

    throw ResponseError(400, "Presensi hari ini sudah lengkap");
  }
}
