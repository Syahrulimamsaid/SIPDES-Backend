import type { SubDistrictModel } from "./model";
import { SubDistrictService } from "./service";

export class SubDistrictController {
  static async get(user: any) {
    return await SubDistrictService.get(user);
  }

  static async create(body: SubDistrictModel["createBody"], user: any) {
    return await SubDistrictService.create(body, user);
  }

  static async update(id: string, body: SubDistrictModel["updateBody"], user: any) {
    return await SubDistrictService.update(id, body, user);
  }

  static async destroy(id: string, user: any) {
    return await SubDistrictService.destroy(id, user);
  }
}
