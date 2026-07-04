import { User, Village, Location, sequelize, SubDistrict } from "../../models/index";
import { VillageModel } from "./model";
import { ResponseError } from "../../response/response-error";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import subDistrict from "../sub-district";

export class VillageService {
  static async get(user: any) {
    const whereClause: any = {};
    if (user.role !== "admin") {
      if (!user.villageId) {
        return [];
      }
      whereClause.id = user.villageId;
    }

    const villages = await Village.findAll({
      where: whereClause,
      attributes: ["id", "name", "address"],
      include: [{
        model: SubDistrict,
        attributes: ["id", "name"],
        required: true
      }]
    });

    const result = await Promise.all(
      villages.map(async (v: any) => {
        const userCount = await User.count({ where: { villageId: v.id } });
        const locationCount = await Location.count({ where: { villageId: v.id } });
        return {
          id: v.id,
          name: v.name,
          address: v.address,
          subDistrict: v.SubDistrict,
          user_count: Number(userCount || 0),
          location_count: Number(locationCount || 0),
        }
      })
    );

    return result;

  }

  static async create(body: VillageModel["createBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const existingName = await Village.findOne({
      where: sequelize.where(
        sequelize.fn("lower", sequelize.col("name")),
        body.name.toLowerCase()
      )
    });
    if (existingName) {
      throw ResponseError(400, "Nama desa sudah digunakan");
    }

    const id = uuidv4();
    const newVillage = await Village.create({
      id,
      name: body.name,
      address: body.address,
      subDistrictId: body.subDistrictId,
    });

    return {
      id: newVillage.id,
      name: newVillage.name,
      address: newVillage.address,
      subDistrictId: newVillage.subDistrictId,
    };
  }

  static async update(id: string, body: VillageModel["updateBody"], user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const village = await Village.findByPk(id);
    if (!village) {
      throw ResponseError(404, "Desa tidak ditemukan");
    }

    const updateData: any = {};

    if (body.name !== undefined) {
      const existingName = await Village.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.and]: sequelize.where(
            sequelize.fn("lower", sequelize.col("name")),
            body.name.toLowerCase()
          )
        }
      });
      if (existingName) {
        throw ResponseError(400, "Nama desa sudah digunakan");
      }
      updateData.name = body.name;
    }

    if (body.address !== undefined) {
      updateData.address = body.address;
    }

    if (body.subDistrictId !== undefined) {
      updateData.subDistrictId = body.subDistrictId;
    }

    await village.update(updateData);

    return {
      id: village.id,
      name: village.name,
      address: village.address,
      subDistrictId: village.subDistrictId || null,
    };
  }

  static async destroy(id: string, user: any) {
    if (user.role !== "admin") {
      throw ResponseError(403, "Akses ditolak");
    }

    const village = await Village.findByPk(id);
    if (!village) {
      throw ResponseError(404, "Desa tidak ditemukan");
    }

    const hasUser = await User.findOne({
      where: { villageId: id }
    });
    if (hasUser) {
      throw ResponseError(400, "Desa tidak dapat dihapus karena memiliki data pengguna");
    }

    const hasLocation = await Location.findOne({
      where: { villageId: id }
    });
    if (hasLocation) {
      throw ResponseError(400, "Desa tidak dapat dihapus karena memiliki data lokasi");
    }

    await Village.destroy({ where: { id } });
    return true;
  }
}
