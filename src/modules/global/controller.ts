import { GlobalModel } from "./model";
import { GlobalService } from "./service";

export class GlobalController {
  static async getStats(user: any) {
    return await GlobalService.getStats(user);
  }

  static async getStatsPresence(query: GlobalModel["getQueryStatsPresence"], user: any) {
    return await GlobalService.getStatsPresence(query, user);
  }
}
