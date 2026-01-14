import { prisma } from "../../lib/prisma";

export class CommentsService {
  static async listForEvent(eventId: string, companyId: string) {
    return prisma.eventComment.findMany({
      where: {
        eventId,
        event: { companyId },
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async create(params: {
    eventId: string;
    userId: string;
    text: string;
  }) {
    const { eventId, userId, text } = params;
    return prisma.eventComment.create({
      data: {
        eventId,
        userId,
        text,
      },
    });
  }
}

