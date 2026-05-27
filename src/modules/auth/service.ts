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

  static async changePassword(body: AuthModel["changePassBody"], user: any) {
    const { old_password, new_password, confirm_password } = body;

    if (new_password !== confirm_password) {
      throw ResponseError(400, "Konfirmasi password tidak sesuai");
    }

    const existingUser = await User.findByPk(user.id);

    if (!existingUser) {
      throw ResponseError(404, "User tidak ditemukan");
    }

    const isMatch = await Bun.password.verify(
      old_password,
      existingUser.password,
    );

    if (!isMatch) {
      throw ResponseError(400, "Password lama salah");
    }

    const isSamePassword = await Bun.password.verify(
      new_password,
      existingUser.password,
    );

    if (isSamePassword) {
      throw ResponseError(
        400,
        "Password baru tidak boleh sama dengan password lama",
      );
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await existingUser.update({
      password: hashedPassword,
    });

    return {
      message: "Password berhasil diubah",
    };
  }
}
