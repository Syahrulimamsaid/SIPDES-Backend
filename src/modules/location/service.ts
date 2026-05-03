import type { LocationModel } from "./model";
import { ResponseError } from "../../response/response-error";
import { LocationAccess, Location, Presence } from "../../models/index";
import { getDistance } from "../../helpers/getDistance";
import { Op } from "sequelize";

export class LocationService {
  static async getByAccess(user: any) {
    const locations = await LocationAccess.findAll({
      where: { userId: user.id },
      attributes: ["id", "description", "locationId"],
      include: [
        {
          model: Location,
          attributes: ["id", "name", "lat", "lng", "radius"],
          required: true,
        },
      ],
    });

    if (!locations || locations.length === 0) {
      throw ResponseError(404, "Data not found");
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const locationIds = locations.map((l: any) => l.locationId);

    const presences = await Presence.findAll({
      where: {
        userId: user.id,
        locationId: {
          [Op.in]: locationIds,
        },
        in: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });

    const presenceMap: Record<string, any> = {};
    presences.forEach((p: any) => {
      presenceMap[p.locationId] = p;
    });

    return locations.map((item: any) => {
      const p = presenceMap[item.locationId];

      let status = "";

      if (p) {
        if (p.in && !p.out) {
          status = "MASUK";
        } else if (p.in && p.out) {
          status = "HADIR";
        }
      }

      return {
        id: item.id,
        description: item.description,

        location: {
          id: item.Location.id,
          name: item.Location.name,
          lat: String(item.Location.lat),
          lng: String(item.Location.lng),
          radius: String(item.Location.radius),
        },

        presence: {
          status,
          in: p?.in ? new Date(p.in).toISOString() : null,
          out: p?.out ? new Date(p.out).toISOString() : null,
        },
      };
    });
  }

  static async checkLocation(body: LocationModel["locationCheckBody"]) {
    const location = await Location.findOne({ where: { id: body.locationId } });

    if (!location) {
      throw ResponseError(404, "Location not found");
    }
    const distance = getDistance(
      body.lat,
      body.lng,
      Number(location.lat),
      Number(location.lng),
    );

    return {
      name: location.name,
      location: location.lat + " " + location.lng,
      distance: Math.round(distance).toString(),
      isInside: distance <= location.radius,
    };
  }
}
