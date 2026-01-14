import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { t } from "../../config/i18n";
import { CommentsService } from "./comments.service";

export const commentsRouter = Router();

commentsRouter.use(requireAuth);

commentsRouter.get("/", async (req, res) => {
  const user = req.authUser!;
  if (!user.companyId) {
    return res.status(403).json({ error: t().errors.forbidden });
  }

  const { eventId } = req.query;
  if (!eventId || typeof eventId !== "string") {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const comments = await CommentsService.listForEvent(eventId, user.companyId);
  return res.json({ items: comments });
});

const createCommentSchema = z.object({
  eventId: z.string().min(1),
  text: z.string().min(1),
});

commentsRouter.post("/", async (req, res) => {
  const user = req.authUser!;

  const parseResult = createCommentSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: t().errors.invalidInput });
  }

  const data = parseResult.data;

  const comment = await CommentsService.create({
    eventId: data.eventId,
    userId: user.id,
    text: data.text,
  });

  return res.status(201).json(comment);
});

