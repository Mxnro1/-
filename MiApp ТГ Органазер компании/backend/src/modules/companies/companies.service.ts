import { prisma } from "../../lib/prisma";
import { generateRandomToken } from "../../utils/tokens";

export class CompaniesService {
  static async createCompany(params: { ownerUserId: string; name: string; timezone: string }) {
    const { ownerUserId, name, timezone } = params;
    const company = await prisma.company.create({
      data: {
        name,
        timezone,
        ownerUserId,
        members: {
          create: {
            userId: ownerUserId,
            role: "OWNER",
          },
        },
      },
    });
    return company;
  }

  static async listForUser(userId: string) {
    return prisma.company.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
    });
  }

  static async createInvite(params: {
    companyId: string;
    email: string;
    role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  }) {
    const { companyId, email, role } = params;
    const token = generateRandomToken(16);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 дней

    const invite = await prisma.invite.create({
      data: {
        companyId,
        email,
        role,
        token,
        expiresAt,
      },
    });

    return invite;
  }

  static async acceptInvite(params: { userId: string; token: string }) {
    const { userId, token } = params;
    const now = new Date();

    const invite = await prisma.invite.findFirst({
      where: {
        token,
        expiresAt: { gt: now },
      },
    });

    if (!invite) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.emailVerified || user.email !== invite.email) {
      // Email должен быть подтверждён и совпадать с email приглашения
      return null;
    }

    const membership = await prisma.companyMember.upsert({
      where: {
        companyId_userId: {
          companyId: invite.companyId,
          userId,
        },
      },
      update: {
        role: invite.role,
      },
      create: {
        companyId: invite.companyId,
        userId,
        role: invite.role,
      },
    });

    return { invite, membership };
  }
}

