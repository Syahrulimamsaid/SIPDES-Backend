import { User, Village, Presence } from "../../models/index";
import { ResponseError } from "../../response/response-error";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import type { UserModel } from "./model";
import { Op } from "sequelize";

export class UserService {
  static async get(user: any) {
    let userId, villageId;
    if (user.role != "admin") villageId = user.villageId;
    if (user.role == "umum") userId = user.id;

    const users = await User.findAll({
      attributes: ["id", "phone_number", "fullname", "role"],
      where: {
        ...(userId && {
          id: userId,
        }),
        ...(villageId && user.role == 'operator' && {
          role: "umum",
          villageId: villageId
        }),
        ...(user.role == 'admin' && {
          role: { [Op.in]: ["operator", "umum"] },
        })
      },
      include: [
        {
          model: Village,
          attributes: ["id", "name", "address"],
          required: false,
          where: {
            ...(villageId && {
              id: villageId,
            }),
          },
        },
      ],
      order: [
        [Village, "name", "ASC"],
        ["fullname", "ASC"],
      ],
    });

    const result = users.map((data: any) => ({
      id: data.id,
      phone_number: data.phone_number,
      fullname: data.fullname,
      role: data.role,
      ...(data.Village && {
        village: {
          id: data.Village.id,
          name: data.Village.name,
          address: data.Village.address,
        },
      }),
    }));

    return result;
  }

  static async destroy(id: string, user: any) {
    const targetUser = await User.findOne({ where: { id } });
    if (!targetUser) throw ResponseError(404, "User tidak ditemukan");

    if (user.role !== "admin") {
      if (targetUser.villageId !== user.villageId || targetUser.role !== "umum") {
        throw ResponseError(403, "Akses ditolak");
      }
    }

    const existingPresence = await Presence.findOne({ where: { userId: id } });
    if (existingPresence) {
      throw ResponseError(400, "User tidak dapat dihapus karena memiliki data presensi");
    }

    await User.destroy({ where: { id } });
    return true;
  }

  static async create(body: UserModel["createBody"], user: any) {
    if (user.role !== "admin") {
      if (user.role === "operator") {
        if (body.role !== "umum") {
          throw ResponseError(403, "Operator hanya dapat membuat user dengan role umum");
        }
        if (body.villageId && body.villageId !== user.villageId) {
          throw ResponseError(403, "Operator hanya dapat membuat user untuk desa sendiri");
        }
        body.role = "umum";
        body.villageId = user.villageId;
      } else {
        throw ResponseError(403, "Akses ditolak");
      }
    }

    const existingUser = await User.findOne({
      where: { phone_number: body.phone_number },
    });
    if (existingUser) {
      throw ResponseError(400, "Nomor telepon sudah digunakan");
    }

    if (body.villageId) {
      const village = await Village.findByPk(body.villageId);
      if (!village) {
        throw ResponseError(400, "Desa tidak ditemukan");
      }
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);
    const id = uuidv4();

    const newUser = await User.create({
      id,
      phone_number: body.phone_number,
      password: hashedPassword,
      fullname: body.fullname,
      role: body.role,
      villageId: body.villageId || null,
    });

    return {
      id: newUser.id,
      phone_number: newUser.phone_number,
      fullname: newUser.fullname,
      role: newUser.role,
      villageId: newUser.villageId,
    };
  }

  static async update(id: string, body: UserModel["updateBody"], user: any) {
    const targetUser = await User.findOne({ where: { id } });
    if (!targetUser) throw ResponseError(404, "User tidak ditemukan");

    if (user.role !== "admin") {
      if (targetUser.villageId !== user.villageId && targetUser.role == "operator") {
        throw ResponseError(403, "Akses ditolak");
      }
    }

    const hasPresence = await Presence.findOne({ where: { userId: id } });
    const updateData: any = {};

    if (user.role === "admin") {
      if (!hasPresence) {
        if (body.fullname !== undefined) updateData.fullname = body.fullname;
        if (body.phone_number !== undefined) updateData.phone_number = body.phone_number;
        if (body.password !== undefined) updateData.password = body.password;
        if (body.villageId !== undefined) updateData.villageId = body.villageId;
        if (body.role !== undefined) updateData.role = body.role;
      } else {
        if (body.fullname !== undefined) updateData.fullname = body.fullname;
        if (body.password !== undefined) updateData.password = body.password;

        if (body.role !== undefined && body.role !== targetUser.role) {
          throw ResponseError(400, "Role tidak dapat diubah karena user memiliki data presensi");
        }
        if (body.phone_number !== undefined && body.phone_number !== targetUser.phone_number) {
          throw ResponseError(400, "Nomor telepon tidak dapat diubah karena user memiliki data presensi");
        }
        if (body.villageId !== undefined && body.villageId !== targetUser.villageId) {
          throw ResponseError(400, "Desa tidak dapat diubah karena user memiliki data presensi");
        }
      }
    } else if (user.role === "operator") {
      if (!hasPresence) {
        if (body.fullname !== undefined) updateData.fullname = body.fullname;
        if (body.password !== undefined) updateData.password = body.password;
        if (body.phone_number !== undefined) updateData.phone_number = body.phone_number;

        if (body.villageId !== undefined) {
          if (user.role === "operator") {
            updateData.villageId = user.villageId;
          }
        }

        if (body.role !== undefined && body.role !== "umum") {
          throw ResponseError(403, "Operator tidak dapat mengubah role menjadi non-umum");
        }
      } else {
        if (body.fullname !== undefined) updateData.fullname = body.fullname;
        if (body.password !== undefined) updateData.password = body.password;

        if (body.role !== undefined && body.role !== targetUser.role) {
          throw ResponseError(400, "Role tidak dapat diubah karena user memiliki data presensi");
        }
        if (body.phone_number !== undefined && body.phone_number !== targetUser.phone_number) {
          throw ResponseError(400, "Nomor telepon tidak dapat diubah karena user memiliki data presensi");
        }
        if (body.villageId !== undefined && body.villageId !== targetUser.villageId) {
          throw ResponseError(400, "Desa tidak dapat diubah karena user memiliki data presensi");
        }
      }
    } else {
      throw ResponseError(403, "Akses ditolak");
    }

    if (updateData.phone_number && updateData.phone_number !== targetUser.phone_number) {
      const phoneExist = await User.findOne({ where: { phone_number: updateData.phone_number } });
      if (phoneExist) {
        throw ResponseError(400, "Nomor telepon sudah digunakan");
      }
    }

    if (updateData.villageId) {
      const village = await Village.findByPk(updateData.villageId);
      if (!village) {
        throw ResponseError(400, "Desa tidak ditemukan");
      }
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await targetUser.update(updateData);

    return {
      id: targetUser.id,
      phone_number: targetUser.phone_number,
      fullname: targetUser.fullname,
      role: targetUser.role,
      villageId: targetUser.villageId,
    };
  }

  static async resetDevice(params: UserModel["resetDeviceBody"], user: any) {
    const userId = params.userId;
    const targetUser = await User.findOne({ where: { id: userId } });
    if (!targetUser) throw ResponseError(404, "User tidak ditemukan");

    if (user.role == "umum" || (targetUser.villageId !== user.villageId && targetUser.role == "operator")) throw ResponseError(403, "Akses ditolak");

    await targetUser.update({ device: null });
    return true;
  }
}
