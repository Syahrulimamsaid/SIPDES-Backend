import { User } from "../../interfaces/user.interface";
import { PresenceModel } from "./model";
import { PresenceService } from "./service";

export class PresenceController {
  static async get(body: PresenceModel["getQuery"], user: any) {
    const data = await PresenceService.get(body, user);
    return data;
  }

  static async getByUser(periode: Date, user: User) {
    const data = await PresenceService.getByUser(periode, user);
    return data;
  }
  static async getById(id: string, user: User) {
    const data = await PresenceService.getById(id, user);
    return data;
  }

  static async getByQueue(user: User) {
    const data = await PresenceService.getByQueue(user);
    return data;
  }

  static async presenceQueue(body: PresenceModel["presenceBody"], user: User) {
    const data = await PresenceService.presenceQueue(body, user);
    return data;
  }

  static async presence(body: PresenceModel["presenceQueue"]) {
    const data = await PresenceService.presence(body);
    return data;
  }

  static async update(body: PresenceModel["updateBody"], user: any) {
    const data = await PresenceService.update(body, user);
    return data;
  }

  static async destory(id: string, user: any) {
    const data = await PresenceService.destroy(id, user);
    return data;
  }

  static async create(body: PresenceModel["createBody"], user: any) {
    const data = await PresenceService.create(body, user);
    return data;
  }
}
