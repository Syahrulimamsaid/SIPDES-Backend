import { SettingModel } from "./model";
import { SettingService } from "./service";

export class SettingController {
  static async get() {
    return await SettingService.get();
  }

  static async update(body: SettingModel['updateBody'], user: any) {
    return await SettingService.update(body, user);
  }
}
