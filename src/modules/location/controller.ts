import { ResponseError } from "../../response/response-error";
import type { AuthModel } from "../auth/model";
import { LocationModel } from "./model";
import { LocationService } from "./service";

export class LocationController {
  static async getByAccess(user:any) {
    const data = await LocationService.getByAccess(user);
    return data;
  }

    static async checkLocation(body: LocationModel["locationCheckBody"]) {
    const data = await LocationService.checkLocation(body);
    return data;
  }
}
