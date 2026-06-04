import type { UserModel } from "./model";
import { User, Village } from "../../models/index";
import { AuthModel } from "../auth/model";
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
        ...(villageId && {
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
}
