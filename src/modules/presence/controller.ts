import { ResponseError } from "../../response/response-error";
import type { AuthModel } from "../auth/model";
import { PresenceModel } from "./model";
import { PresenceService } from "./service";

export class PresenceController {
  static async get(user: any) {
    const data = await PresenceService.get(user);
    return data;
  }
  static async getById(id: string, user: any) {
    const data = await PresenceService.getById(id, user);
    return data;
  }

  static async getByQueue(user: any) {
    const data = await PresenceService.getByQueue(user);
    return data;
  }

  static async presenceQueue(body: PresenceModel["presenceBody"], user: any) {
    const data = await PresenceService.presenceQueue(body, user);
    return data;
  }

  static async presence(body: PresenceModel["presenceQueue"]) {
    const data = await PresenceService.presence(body);
    return data;
  }
}
