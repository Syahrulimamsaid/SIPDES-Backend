import type { AuthModel } from "./model";
import { ResponseError } from "../../response/response-error";
import bcrypt from "bcrypt";
import { User, Village } from "../../models/index";

export class AuthService {
  static async signIn({ phone_number, password }: AuthModel["signInBody"]) {
    const user = await User.findOne({
      where: { phone_number },
      attributes: ["id", "password", "phone_number", "fullname", "role"],
      include: [
        {
          model: Village,
          attributes: ["id", "name","address"],
          required: false,
        },
      ],
    });

    if (!user || !user.password) {
      throw ResponseError(404, "Invalid phone number or password");
    }

    if (!(await bcrypt.compare(password, user.password)))
      throw ResponseError(
        400,
        "Invalid phone number or password"
      );

    return {
      id: user.id,
      phone_number: user.phone_number,
      fullname: user.fullname,
      role: user.role,
      village : user.Village
    };
  }

  static async get(session: any) {
    const user = await User.findOne({
      where: { id: session.id },
      attributes: ["id", "phone_number", "password", "fullname", "role"],
    });

    if (!user || user.length == 0) {
      throw ResponseError(404, "Data not found");
    }

    return user.get();
  }
}
