import { Router } from "express";
import { z } from "zod";
import { AuthService } from "./auth.service";
import { t } from "../../config/i18n";

export const authRouter = Router();

const telegramLoginSchema = z.object({
  initData: z.string(),
});

authRouter.post("/telegram-login", async (req, res) => {
  const parseResult = telegramLoginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    // В продакшене это должна быть проблемой конфигурации, а не клиентской ошибкой
    return res.status(500).json({ error: "Сервер не настроен (отсутствует TELEGRAM_BOT_TOKEN)" });
  }

  try {
    const result = await AuthService.loginWithTelegram({
      initData: parseResult.data.initData,
      botToken,
    });

    return res.json({
      token: result.token,
      user: {
        id: result.user.id,
        name: result.user.name,
        telegramId: result.user.telegramId,
        emailVerified: result.user.emailVerified,
      },
      message: result.message,
    });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || t().errors.invalidInput });
  }
});

const requestEmailVerificationSchema = z.object({
  email: z.string().email(),
});

authRouter.post("/request-email-verification", async (req, res) => {
  if (!req.authUser) {
    return res.status(401).json({ error: t().errors.unauthorized });
  }

  const parseResult = requestEmailVerificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  try {
    const result = await AuthService.requestEmailVerification({
      userId: req.authUser.id,
      email: parseResult.data.email,
    });

    return res.json({
      message: result.message,
    });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || t().errors.invalidInput });
  }
});

const verifyEmailSchema = z.object({
  token: z.string().min(1),
});

authRouter.post("/verify-email", async (req, res) => {
  const parseResult = verifyEmailSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  try {
    const result = await AuthService.verifyEmail({
      token: parseResult.data.token,
    });

    return res.json({
      message: result.message,
      user: {
        id: result.user.id,
        emailVerified: result.user.emailVerified,
      },
    });
  } catch (e: any) {
    return res.status(400).json({ error: e.message || t().errors.invalidInput });
  }
});

const selectCompanySchema = z.object({
  companyId: z.string().min(1),
});

authRouter.post("/select-company", async (req, res) => {
  if (!req.authUser) {
    return res.status(401).json({ error: t().errors.unauthorized });
  }

  const parseResult = selectCompanySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  try {
    const result = await AuthService.selectCompany({
      userId: req.authUser.id,
      companyId: parseResult.data.companyId,
    });

    return res.json({
      token: result.token,
      companyId: result.companyId,
      role: result.role,
    });
  } catch (e: any) {
    return res.status(403).json({ error: e.message || t().errors.forbidden });
  }
});
