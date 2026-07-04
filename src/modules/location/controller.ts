import { User } from "../../interfaces/user.interface";
import { ResponseError } from "../../response/response-error";
import type { AuthModel } from "../auth/model";
import { LocationModel } from "./model";
import { LocationService } from "./service";

export class LocationController {
  static async getByAccess(user:User) {
    const data = await LocationService.getByAccess(user);
    return data;
  }

    static async checkLocation(body: LocationModel["locationCheckBody"]) {
    const data = await LocationService.checkLocation(body);
    return data;
  }

  static async getByAccessUser(body: LocationModel["locationAccessByUserBody"]) {
    const data = await LocationService.getByAccessUser(body);
    return data;
  }

  static async createAccess(body: LocationModel["createAccessBody"], user: any) {
    const data = await LocationService.createAccess(body, user);
    return data;
  }

  static async deleteAccess(id: string, user: any) {
    const data = await LocationService.deleteAccess(id, user);
    return data;
  }

  static async getAllAccess(user: any) {
    const data = await LocationService.getAllAccess(user);
    return data;
  }

  static async getLocations(user: any) {
    const data = await LocationService.getLocations(user);
    return data;
  }

  static async createLocation(body: LocationModel["createLocationBody"], user: any) {
    const data = await LocationService.createLocation(body, user);
    return data;
  }

  static async updateLocation(id: string, body: LocationModel["updateLocationBody"], user: any) {
    const data = await LocationService.updateLocation(id, body, user);
    return data;
  }

  static async deleteLocation(id: string, user: any) {
    const data = await LocationService.deleteLocation(id, user);
    return data;
  }
}
