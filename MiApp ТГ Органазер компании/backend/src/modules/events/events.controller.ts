import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { t } from "../../config/i18n";
import { EventsService } from "./events.service";
import { ensureCalendarPermission } from "../../middleware/calendarPermissions";

export const eventsRouter = Router();

eventsRouter.use(requireAuth);

eventsRouter.get("/", async (req, res, next) => {
  // Проверка прав на просмотр календаря
  await ensureCalendarPermission(req, res, async () => {
    const user = req.authUser!;
    if (!user.companyId) {
      return res.status(403).json({ error: t().errors.forbidden });
    }

    const { calendarId, from, to } = req.query;
    if (!calendarId || typeof calendarId !== "string") {
      return res.status(400).json({ error: t().errors.invalidInput });
    }

    const fromDate =
      from && typeof from === "string" ? new Date(from) : undefined;
    const toDate = to && typeof to === "string" ? new Date(to) : undefined;

    const events = await EventsService.listForCalendar({
      companyId: user.companyId,
      calendarId,
      from: fromDate,
      to: toDate,
    });

    return res.json({ items: events });
  }, "VIEW");
});

const createEventSchema = z.object({
  calendarId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  allDay: z.boolean().optional().default(false),
});

eventsRouter.post("/", async (req, res) => {
  const user = req.authUser!;
  if (!user.companyId) {
    return res.status(403).json({ error: t().errors.forbidden });
  }

  const parseResult = createEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const data = parseResult.data;

  await ensureCalendarPermission(
    req,
    res,
    async () => {
      const event = await EventsService.create({
        companyId: user.companyId!,
        calendarId: data.calendarId,
        title: data.title,
        description: data.description,
        startAt: new Date(data.startAt),
        endAt: new Date(data.endAt),
        allDay: data.allDay,
        createdById: user.id,
      });

      return res.status(201).json(event);
    },
    "EDIT"
  );
});

