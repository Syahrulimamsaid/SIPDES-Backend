import { GlobalService } from "./service";

export class GlobalController {
  static async getStats(user: any) {
    return await GlobalService.getStats(user);
  }

  static async getStatsPresence(user: any) {
    return await GlobalService.getStatsPresence(user);
  }
}
