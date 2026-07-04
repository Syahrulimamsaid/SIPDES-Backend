import type { VillageModel } from "./model";
import { VillageService } from "./service";

export class VillageController {
  static async get(user: any) {
    return await VillageService.get(user);
  }

  static async create(body: VillageModel["createBody"], user: any) {
    return await VillageService.create(body, user);
  }

  static async update(id: string, body: VillageModel["updateBody"], user: any) {
    return await VillageService.update(id, body, user);
  }

  static async destroy(id: string, user: any) {
    return await VillageService.destroy(id, user);
  }
}
