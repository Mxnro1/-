import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { requireCompanyRole } from "../../middleware/rbac";
import { CalendarsService } from "./calendars.service";
import { t } from "../../config/i18n";

export const calendarsRouter = Router();

calendarsRouter.use(requireAuth);

calendarsRouter.get("/", async (req, res) => {
  const user = req.authUser!;
  if (!user.companyId) {
    return res.status(403).json({ error: t().errors.forbidden });
  }
  const calendars = await CalendarsService.listForCompany(
    user.companyId,
    user.id
  );
  // TODO: фильтровать по доступу пользователя к конкретным календарям
  return res.json({ items: calendars });
});

const createCalendarSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
});

calendarsRouter.post(
  "/",
  requireCompanyRole(["OWNER", "ADMIN"]),
  async (req, res) => {
    const user = req.authUser!;
    if (!user.companyId) {
      return res.status(403).json({ error: t().errors.forbidden });
    }

    const parseResult = createCalendarSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: t().errors.invalidInput });
    }

    const calendar = await CalendarsService.create({
      companyId: user.companyId,
      ownerUserId: user.id,
      name: parseResult.data.name,
      type: parseResult.data.type,
    });

    return res.status(201).json(calendar);
  }
);

