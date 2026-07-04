import type { LocationModel } from "./model";
import { ResponseError } from "../../response/response-error";
import { LocationAccess, Location, Presence, User, Village, sequelize } from "../../models/index";
import { getDistance } from "../../helpers/getDistance";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

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

    const locationIds = locations.map((l: any) => l.id);

    const presences = await Presence.findAll({
      where: {
        userId: user.id,
        locationAccessId: {
          [Op.in]: locationIds,
        },
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
          },
        ],
      },
    });

    const presenceMap: Record<string, any> = {};
    presences.forEach((p: any) => {
      presenceMap[p.locationAccessId] = p;
    });

    return locations.map((item: any) => {
      const p = presenceMap[item.id];
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
          status: p?.status ?? "",
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

  static async getByAccessUser(body: LocationModel["locationAccessByUserBody"]) {
    const locations = await LocationAccess.findAll({
      where: { userId: body.userId },
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

    return locations.map((item: any) => {
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
      };
    });
  }

  static async createAccess(body: LocationModel["createAccessBody"], user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const targetUser = await User.findByPk(body.userId);
    if (!targetUser) {
      throw ResponseError(404, "User tidak ditemukan");
    }

    const targetLocation = await Location.findByPk(body.locationId);
    if (!targetLocation) {
      throw ResponseError(404, "Lokasi tidak ditemukan");
    }

    if (user.role === "operator") {
      if (targetUser.villageId !== user.villageId) {
        throw ResponseError(403, "Operator hanya dapat mengatur akses lokasi untuk user di desa yang sama");
      }
      if (targetLocation.villageId !== user.villageId) {
        throw ResponseError(403, "Operator hanya dapat mengatur akses lokasi untuk lokasi di desa yang sama");
      }
    }

    const existingAccess = await LocationAccess.findOne({
      where: {
        userId: body.userId,
        locationId: body.locationId
      }
    });
    if (existingAccess) {
      throw ResponseError(400, "Akses lokasi untuk user ini sudah ada");
    }

    const id = uuidv4();
    const newAccess = await LocationAccess.create({
      id,
      userId: body.userId,
      locationId: body.locationId,
      description: body.description || null,
    });

    return {
      id: newAccess.id,
      userId: newAccess.userId,
      locationId: newAccess.locationId,
      description: newAccess.description,
    };
  }

  static async deleteAccess(id: string, user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const targetAccess = await LocationAccess.findOne({
      where: { id },
      include: [
        {
          model: User,
          required: false,
        }
      ]
    });
    if (!targetAccess) {
      throw ResponseError(404, "Akses lokasi tidak ditemukan");
    }

    if (user.role === "operator") {
      if (!targetAccess.User || targetAccess.User.villageId !== user.villageId) {
        throw ResponseError(403, "Operator hanya dapat menghapus akses lokasi untuk user di desa yang sama");
      }
    }

    const hasPresence = await Presence.findOne({
      where: { locationAccessId: id }
    });
    if (hasPresence) {
      throw ResponseError(400, "Akses lokasi tidak dapat dihapus karena memiliki data presensi");
    }

    await LocationAccess.destroy({ where: { id } });
    return true;
  }

  static async getAllAccess(user: any) {
    if (user.role !== "admin" && user.role !== "operator") {
      throw ResponseError(403, "Akses ditolak");
    }

    const whereUser: any = { role: "umum" };
    const whereLocation: any = {};

    if (user.role === "operator") {
      whereUser.villageId = user.villageId;
      whereLocation.villageId = user.villageId;
    }

    const users = await User.findAll({
      where: whereUser,
      include: [
        {
          model: Village,
          attributes: ["id", "name", "address"],
          required: false,
        },
        {
          model: Location,
          required: false,
          where: whereLocation,
          through: {
            attributes: ["id", "description"],
          },
        },
      ],
    });

    const result: any[] = [];

    for (const u of users) {
      const locationAccess: any[] = [];
      if (u.Locations && u.Locations.length > 0) {
        for (const loc of u.Locations) {
          locationAccess.push({
            id: loc.LocationAccess.id,
            description: loc.LocationAccess.description || null,
            location: {
              id: loc.id,
              name: loc.name,
              lat: Number(loc.lat),
              lng: Number(loc.lng),
              radius: Number(loc.radius),
              villageId: loc.villageId,
            },
          });
        }
      }

      result.push({
        id: u.id,
        fullname: u.fullname,
        phone_number: u.phone_number,
        village: u.Village
          ? {
            id: u.Village.id,
            name: u.Village.name,
            address: u.Village.address,
          }
          : null,
        location_access: locationAccess,
      });
    }

    return result;
  }

  static async getLocations(user: any) {
    if (user.role !== "admin" && user.role !== "operator" && user.role !== "umum") {
      throw ResponseError(403, "Akses ditolak");
    }

    const whereClause: any = {};
    if (user.role !== "admin") {
      whereClause.villageId = user.villageId;
    }

    const locations = await Location.findAll({
      where: whereClause,
      include: [
        {
          model: Village,
          attributes: ["id", "name", "address"],
          required: false,
        },
      ],
    });

    return locations.map((loc: any) => ({
      id: loc.id,
      name: loc.name,
      lat: Number(loc.lat),
      lng: Number(loc.lng),
      radius: Number(loc.radius),
      village: loc.Village
        ? {
          id: loc.Village.id,
          name: loc.Village.name,
          address: loc.Village.address,
        }
        : null,
    }));
  }

  static async createLocation(body: LocationModel["createLocationBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const village = await Village.findByPk(body.villageId);
    if (!village) {
      throw ResponseError(400, "Desa tidak ditemukan");
    }

    const existingName = await Location.findOne({
      where: sequelize.where(
        sequelize.fn("lower", sequelize.col("name")),
        body.name.toLowerCase()
      )
    });
    if (existingName) {
      throw ResponseError(400, "Nama lokasi sudah digunakan");
    }

    const existingCoords = await Location.findOne({
      where: {
        lat: body.lat,
        lng: body.lng
      }
    });
    if (existingCoords) {
      throw ResponseError(400, "Lokasi dengan koordinat yang sama sudah ada");
    }

    const id = uuidv4();
    const newLocation = await Location.create({
      id,
      name: body.name,
      lat: body.lat,
      lng: body.lng,
      radius: body.radius,
      villageId: body.villageId,
    });

    return {
      id: newLocation.id,
      name: newLocation.name,
      lat: Number(newLocation.lat),
      lng: Number(newLocation.lng),
      radius: Number(newLocation.radius),
      villageId: newLocation.villageId,
    };
  }

  static async updateLocation(id: string, body: LocationModel["updateLocationBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const location = await Location.findByPk(id);
    if (!location) {
      throw ResponseError(404, "Lokasi tidak ditemukan");
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      const existingName = await Location.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.and]: sequelize.where(
            sequelize.fn("lower", sequelize.col("name")),
            body.name.toLowerCase()
          )
        }
      });
      if (existingName) {
        throw ResponseError(400, "Nama lokasi sudah digunakan");
      }
      updateData.name = body.name;
    }

    if (body.lat !== undefined || body.lng !== undefined) {
      const targetLat = body.lat !== undefined ? body.lat : Number(location.lat);
      const targetLng = body.lng !== undefined ? body.lng : Number(location.lng);

      const existingCoords = await Location.findOne({
        where: {
          id: { [Op.ne]: id },
          lat: targetLat,
          lng: targetLng
        }
      });
      if (existingCoords) {
        throw ResponseError(400, "Lokasi dengan koordinat yang sama sudah ada");
      }
      if (body.lat !== undefined) updateData.lat = body.lat;
      if (body.lng !== undefined) updateData.lng = body.lng;
    }

    if (body.radius !== undefined) {
      updateData.radius = body.radius;
    }

    if (body.villageId !== undefined) {
      const village = await Village.findByPk(body.villageId);
      if (!village) {
        throw ResponseError(400, "Desa tidak ditemukan");
      }
      updateData.villageId = body.villageId;
    }

    await location.update(updateData);

    return {
      id: location.id,
      name: location.name,
      lat: Number(location.lat),
      lng: Number(location.lng),
      radius: Number(location.radius),
      villageId: location.villageId,
    };
  }

  static async deleteLocation(id: string, user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const location = await Location.findByPk(id);
    if (!location) {
      throw ResponseError(404, "Lokasi tidak ditemukan");
    }

    const locationAccesses = await LocationAccess.findAll({
      where: { locationId: id }
    });
    const locationAccessIds = locationAccesses.map((la: any) => la.id);

    if (locationAccessIds.length > 0) {
      const hasPresence = await Presence.findOne({
        where: {
          locationAccessId: {
            [Op.in]: locationAccessIds
          }
        }
      });
      if (hasPresence) {
        throw ResponseError(400, "Lokasi tidak dapat dihapus karena memiliki data presensi");
      }
    }

    await Location.destroy({ where: { id } });
    return true;
  }
}
