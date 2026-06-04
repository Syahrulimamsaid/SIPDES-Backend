import { ResponseError } from "../../response/response-error";
import type { UserModel } from "./model";
import { UserService } from "./service";

export class UserController {
  static async get(user: any) {
  return await UserService.get(user);
  }
}
