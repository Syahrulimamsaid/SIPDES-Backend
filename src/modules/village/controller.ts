import { ResponseError } from "../../response/response-error";
import type { VillageModel } from "./model";
import { VillageService } from "./service";

export class VillageController {
  static async get(user: any) {
  return await VillageService.get(user);
  }
}
