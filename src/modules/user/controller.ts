import { ResponseError } from "../../response/response-error";
import type { UserModel } from "./model";
import { UserService } from "./service";

export class UserController {
  static async get(user: any) {
    return await UserService.get(user);
  }

  static async destroy(id: string, user: any) {
    return await UserService.destroy(id, user);
  }

  static async create(body: UserModel["createBody"], user: any) {
    return await UserService.create(body, user);
  }

  static async update(id: string, body: UserModel["updateBody"], user: any) {
    return await UserService.update(id, body, user);
  }
}
