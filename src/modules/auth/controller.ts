import { ResponseError } from "../../response/response-error";
import type { AuthModel } from "./model";
import { AuthService } from "./service";

export class AuthController {
  static async signIn(body: AuthModel["signInBody"], jwt: any) {
    const user = await AuthService.signIn(body);
    const token = await jwt.sign(
      {
        id: user.id,
        phone_number: user.phone_number,
        fullname: user.fullname,
        role: user.role,
        villageId: user.village?.id || null,
      },
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "30m",
      },
    );

    return {
      ...user,
      token,
    };
  }

  static async changePassword(body: AuthModel["changePassBody"], user: any) {
    return await AuthService.changePassword(body, user);
  }
}
