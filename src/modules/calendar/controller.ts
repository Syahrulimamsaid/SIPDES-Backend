import { CalendarService } from "./service";

export class CalendarController {
  async workDays(start: string, end: string) {
    return CalendarService.workDays(start, end);
  }

  static async get(query: any) {
    return await CalendarService.get(query);
  }

  static async getById(id: string) {
    return await CalendarService.getById(id);
  }

  static async create(body: any, user: any) {
    return await CalendarService.create(body, user);
  }

  static async update(id: string, body: any, user: any) {
    return await CalendarService.update(id, body, user);
  }

  static async destroy(id: string, user: any) {
    return await CalendarService.destroy(id, user);
  }
}

