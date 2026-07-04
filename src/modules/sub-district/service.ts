import { SubDistrict, Village, Location, LocationAccess, Presence, sequelize } from "../../models/index";
import type { SubDistrictModel } from "./model";
import { ResponseError } from "../../response/response-error";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export class SubDistrictService {
  static async get(user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const subDistricts = await SubDistrict.findAll({
      attributes: ["id", "name"],
      include: [
        {
          model: Village,
          attributes: ["id", "name"],
        },
      ],
    });

    return subDistricts.map((sd: any) => ({
      id: sd.id,
      name: sd.name,
      villages: sd.Villages,
    }));
  }

  static async create(body: SubDistrictModel["createBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const existingName = await SubDistrict.findOne({
      where: sequelize.where(
        sequelize.fn("lower", sequelize.col("name")),
        body.name.toLowerCase()
      )
    });
    if (existingName) {
      throw ResponseError(400, "Nama kecamatan sudah digunakan");
    }

    const id = uuidv4();
    const newSubDistrict = await SubDistrict.create({
      id,
      name: body.name,
    });

    return {
      id: newSubDistrict.id,
      name: newSubDistrict.name,
    };
  }

  static async update(id: string, body: SubDistrictModel["updateBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const subDistrict = await SubDistrict.findByPk(id);
    if (!subDistrict) {
      throw ResponseError(404, "Kecamatan tidak ditemukan");
    }

    if (body.name !== undefined) {
      const existingName = await SubDistrict.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.and]: sequelize.where(
            sequelize.fn("lower", sequelize.col("name")),
            body.name.toLowerCase()
          )
        }
      });
      if (existingName) {
        throw ResponseError(400, "Nama kecamatan sudah digunakan");
      }
      await subDistrict.update({ name: body.name });
    }

    return {
      id: subDistrict.id,
      name: subDistrict.name,
    };
  }

  static async destroy(id: string, user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const subDistrict = await SubDistrict.findByPk(id);
    if (!subDistrict) {
      throw ResponseError(404, "Kecamatan tidak ditemukan");
    }
    
    const villages = await Village.findAll({ where: { subDistrictId: id } });
    const villageIds = villages.map((v: any) => v.id);

    if (villageIds.length > 0) {
      const locations = await Location.findAll({ where: { villageId: villageIds } });
      const locationIds = locations.map((l: any) => l.id);

      if (locationIds.length > 0) {
        const locationAccesses = await LocationAccess.findAll({ where: { locationId: locationIds } });
        const locationAccessIds = locationAccesses.map((la: any) => la.id);

        if (locationAccessIds.length > 0) {
          const presenceCount = await Presence.count({
            where: { locationAccessId: locationAccessIds }
          });

          if (presenceCount > 0) {
            throw ResponseError(400, "Kecamatan tidak dapat dihapus karena terdapat data presensi pada lokasi di dalamnya");
          }
        }
      }
    }

    await SubDistrict.destroy({ where: { id } });
    return true;
  }
}
