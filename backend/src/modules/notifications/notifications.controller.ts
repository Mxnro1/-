import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { t } from "../../config/i18n";
import { NotificationsService } from "./notifications.service";

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);

notificationsRouter.get("/", async (req, res) => {
  const user = req.authUser!;
  const items = await NotificationsService.listForUser(user.id);
  return res.json({ items });
});

const scheduleNotificationSchema = z.object({
  eventId: z.string().min(1),
  type: z.string().min(1),
  scheduledAt: z.string().datetime(),
});

notificationsRouter.post("/", async (req, res) => {
  const user = req.authUser!;

  const parseResult = scheduleNotificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const data = parseResult.data;

  const notification = await NotificationsService.schedule({
    userId: user.id,
    eventId: data.eventId,
    type: data.type,
    scheduledAt: new Date(data.scheduledAt),
  });

  return res.status(201).json(notification);
});

