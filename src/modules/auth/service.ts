import type { AuthModel } from "./model";
import { ResponseError } from "../../response/response-error";
import bcrypt from "bcrypt";
import { User, Village } from "../../models/index";

export class AuthService {
  static async signIn(body: AuthModel["signInBody"]) {
    const user = await User.findOne({
      where: { phone_number: body.phone_number },
      attributes: [
        "id",
        "password",
        "phone_number",
        "fullname",
        "device",
        "role",
      ],
      include: [
        {
          model: Village,
          attributes: ["id", "name", "address"],
          required: false,
        },
      ],
    });

    if (!user || !user.password) {
      throw ResponseError(404, "Invalid phone number or password");
    }

    if (!(await bcrypt.compare(body.password, user.password)))
      throw ResponseError(400, "Invalid phone number or password");

    // if (!user.device || user.device == null) {
    //   user.update({ device: body.device });
    // } else {
    //   if ((user.device != body.device))
    //     throw ResponseError(400, "Invalid device");
    // }
    
    return {
      id: user.id,
      phone_number: user.phone_number,
      fullname: user.fullname,
      role: user.role,
      village: user.Village,
    };
  }
}
