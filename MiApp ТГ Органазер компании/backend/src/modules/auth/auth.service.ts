import { prisma } from "../../lib/prisma";
import { validateTelegramInitData } from "../../utils/telegram";
import { signJwt } from "../../utils/jwt";
import { t } from "../../config/i18n";
import { generateRandomToken } from "../../utils/tokens";

type TelegramUserPayload = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

export class AuthService {
  // Вход через Telegram WebApp initData
  static async loginWithTelegram(params: {
    initData: string;
    botToken: string;
  }) {
    const { initData, botToken } = params;

    const isValid = validateTelegramInitData(initData, botToken);
    if (!isValid) {
      throw new Error(t().errors.invalidSignature);
    }

    const searchParams = new URLSearchParams(initData);
    const userJson = searchParams.get("user");
    if (!userJson) {
      throw new Error(t().errors.invalidInput);
    }

    const tgUser = JSON.parse(userJson) as TelegramUserPayload;

    const telegramId = String(tgUser.id);
    const name =
      tgUser.first_name ||
      tgUser.last_name ||
      tgUser.username ||
      `user_${telegramId}`;

    let user = await prisma.user.findFirst({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          name,
          email: `${telegramId}@telegram.local`,
          emailVerified: false,
        },
      });
    }

    const token = signJwt({ userId: user.id });

    return {
      token,
      user,
      message: t().auth.telegramLoginSuccess,
    };
  }

  // Запрос на подтверждение email: сохраняем email и создаём токен
  static async requestEmailVerification(params: {
    userId: string;
    email: string;
  }) {
    const { userId, email } = params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        email,
        emailVerified: false,
      },
    });

    // инвалидируем старые токены
    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = generateRandomToken(16);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 минут

    const emailToken = await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // TODO: отправить email с кодом/ссылкой на emailToken.token

    return {
      token: emailToken.token,
      message: t().auth.emailVerificationSent,
    };
  }

  static async verifyEmail(params: { token: string }) {
    const { token } = params;
    const now = new Date();

    const emailToken = await prisma.emailVerificationToken.findFirst({
      where: {
        token,
        expiresAt: { gt: now },
      },
      include: {
        user: true,
      },
    });

    if (!emailToken) {
      throw new Error(t().errors.invalidInput);
    }

    const user = await prisma.user.update({
      where: { id: emailToken.userId },
      data: {
        emailVerified: true,
      },
    });

    await prisma.emailVerificationToken.deleteMany({
      where: { userId: user.id },
    });

    return {
      user,
      message: t().auth.emailVerified,
    };
  }

  // Выбор текущей компании (для многоарендности)
  static async selectCompany(params: { userId: string; companyId: string }) {
    const { userId, companyId } = params;

    const membership = await prisma.companyMember.findFirst({
      where: {
        userId,
        companyId,
      },
    });

    if (!membership) {
      throw new Error(t().errors.forbidden);
    }

    const token = signJwt({ userId, companyId });

    return {
      token,
      companyId,
      role: membership.role,
    };
  }
}

