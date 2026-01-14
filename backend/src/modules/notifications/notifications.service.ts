import { prisma } from "../../lib/prisma";

export class NotificationsService {
  static async schedule(params: {
    userId: string;
    eventId: string;
    type: string;
    scheduledAt: Date;
  }) {
    const { userId, eventId, type, scheduledAt } = params;
    return prisma.notification.create({
      data: {
        userId,
        eventId,
        type,
        scheduledAt,
      },
    });
  }

  static async listForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { scheduledAt: "asc" },
    });
  }
}

