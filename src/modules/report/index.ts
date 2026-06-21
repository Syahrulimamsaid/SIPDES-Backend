import { Elysia } from "elysia";
import { ReportController } from "./controller";
import { ReportModel } from "./model";

const report = new Elysia({ prefix: "/report" });
report.get(
  "/presence",
  async ({ query, user }: any) => {
    const result = await ReportController.getPresenceReport(query, user);
    return result;
  },
  {
    query: ReportModel.getQuery,
    response: {
      200: ReportModel.getReportResponse,
    },
  }
);

export default report;
