import { Setting } from "../../models/index";
import { SettingModel } from "./model";
import { ResponseError } from "../../response/response-error";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

export class SettingService {
  static async update(body: SettingModel['updateBody'], user: any) {
    if (user.role !== "admin") throw ResponseError(403, "Akses ditolak");
    if (!body.in_time || !body.out_time) throw ResponseError(400, "Body is required");

    dayjs.extend(customParseFormat);
    const isValid =
      (dayjs(body.in_time, "HH:mm", true).isValid() ||
        dayjs(body.in_time, "HH:mm:ss", true).isValid()) &&
      (dayjs(body.out_time, "HH:mm", true).isValid() ||
        dayjs(body.out_time, "HH:mm:ss", true).isValid());

    if (!isValid) {
      throw new Error("Format waktu harus HH:mm atau HH:mm:ss");
    }

    const inTime = dayjs(body.in_time, "HH:mm:ss");
    const outTime = dayjs(body.out_time, "HH:mm:ss");

    if (outTime.diff(inTime, "minute") <= 0) throw ResponseError(400, "In time must be before out time");

    const setting = await Setting.findOne();
    if (!setting) throw ResponseError(404, "Data tidak ditemukan");

    await setting.update({ in_time: body.in_time, out_time: body.out_time });

    return {
      in_time: body.in_time,
      out_time: body.out_time,
    };
  }
}
