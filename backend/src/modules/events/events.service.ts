import { prisma } from "../../lib/prisma";

export class EventsService {
  static async listForCalendar(params: {
    companyId: string;
    calendarId: string;
    from?: Date;
    to?: Date;
  }) {
    const { companyId, calendarId, from, to } = params;

    return prisma.event.findMany({
      where: {
        companyId,
        calendarId,
        ...(from || to
          ? {
              startAt: from ? { gte: from } : undefined,
              endAt: to ? { lte: to } : undefined,
            }
          : {}),
      },
      orderBy: { startAt: "asc" },
    });
  }

  static async create(params: {
    companyId: string;
    calendarId: string;
    title: string;
    description?: string;
    startAt: Date;
    endAt: Date;
    allDay: boolean;
    createdById: string;
  }) {
    const {
      companyId,
      calendarId,
      title,
      description,
      startAt,
      endAt,
      allDay,
      createdById,
    } = params;

    return prisma.event.create({
      data: {
        companyId,
        calendarId,
        title,
        description,
        startAt,
        endAt,
        allDay,
        createdById,
      },
    });
  }

  static async update(params: {
    companyId: string;
    eventId: string;
    data: Partial<{
      title: string;
      description: string | null;
      startAt: Date;
      endAt: Date;
      allDay: boolean;
      status: string;
      priority: string;
    }>;
  }) {
    const { companyId, eventId, data } = params;

    // Защитимся от межкомпанейного доступа через where
    return prisma.event.updateMany({
      where: { id: eventId, companyId },
      data,
    });
  }
}

