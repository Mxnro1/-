import { prisma } from "../../lib/prisma";

export class CalendarsService {
  static async listForCompany(companyId: string, userId: string) {
    // TODO: можно фильтровать по доступу пользователя к конкретным календарям
    return prisma.calendar.findMany({
      where: { companyId },
    });
  }

  static async create(params: {
    companyId: string;
    ownerUserId: string;
    name: string;
    type: string;
  }) {
    const { companyId, ownerUserId, name, type } = params;
    return prisma.calendar.create({
      data: {
        companyId,
        ownerUserId,
        name,
        type,
      },
    });
  }
}

