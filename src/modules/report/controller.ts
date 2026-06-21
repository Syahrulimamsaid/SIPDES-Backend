import { ReportModel } from "./model";
import { ReportService } from "./service";

export class ReportController {
  static async getPresenceReport(query: ReportModel["getQuery"], user: any) {
    const data = await ReportService.getPresenceReport(query, user);
    return data;
  }
}
