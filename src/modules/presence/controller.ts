import { ResponseError } from "../../response/response-error";
import type { AuthModel } from "../auth/model";
import { PresenceModel } from "./model";
import { PresenceService } from "./service";

export class PresenceController {
    static async get(user: any) {
    const data = await PresenceService.get(user);
    console.log(data);
    return data;
  }
  static async presence(body: PresenceModel["presenceBody"], user: any) {
    const data = await PresenceService.presence(body, user);
    return data;
  }
}
