import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { t } from "../config/i18n";

type CalendarPermission = "VIEW" | "EDIT" | "MANAGE";

const permissionRank: Record<CalendarPermission, number> = {
  VIEW: 1,
  EDIT: 2,
  MANAGE: 3,
};

export async function ensureCalendarPermission(
  req: Request,
  res: Response,
  next: NextFunction,
  required: CalendarPermission
) {
  const user = req.authUser;
  if (!user || !user.companyId) {
    return res.status(403).json({ error: t().errors.forbidden });
  }

  const calendarId =
    (req.body && req.body.calendarId) ||
    (typeof req.query.calendarId === "string"
      ? req.query.calendarId
      : undefined) ||
    (req.params && (req.params as any).calendarId);

  if (!calendarId) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  // OWNER и ADMIN на уровне компании имеют полный доступ к календарям компании
  if (user.role === "OWNER" || user.role === "ADMIN") {
    return next();
  }

  const membership = await prisma.calendarMember.findFirst({
    where: {
      calendarId,
      userId: user.id,
      calendar: {
        companyId: user.companyId,
      },
    },
  });

  if (!membership) {
    return res.status(403).json({ error: t().errors.forbidden });
  }

  const has =
    permissionRank[membership.permission as CalendarPermission] >=
    permissionRank[required];

  if (!has) {
    return res.status(403).json({ error: t().errors.forbidden });
  }

  return next();
}

