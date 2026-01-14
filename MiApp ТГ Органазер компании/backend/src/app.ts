import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { authRouter } from "./modules/auth/auth.controller";
import { companiesRouter } from "./modules/companies/companies.controller";
import { calendarsRouter } from "./modules/calendars/calendars.controller";
import { eventsRouter } from "./modules/events/events.controller";
import { commentsRouter } from "./modules/comments/comments.controller";
import { notificationsRouter } from "./modules/notifications/notifications.controller";
import { attachUserMiddleware } from "./middleware/auth";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: "*", // TODO: ограничить доверенные origin для продакшена
  })
);
app.use(express.json());
app.use(morgan("dev"));

// Аутентификация и привязка пользователя к запросу
app.use(attachUserMiddleware);

// Роуты
app.use("/auth", authRouter);
app.use("/companies", companiesRouter);
app.use("/calendars", calendarsRouter);
app.use("/events", eventsRouter);
app.use("/comments", commentsRouter);
app.use("/notifications", notificationsRouter);

// Обработчик 404
app.use((_req, res) => {
  res.status(404).json({ error: "Ресурс не найден" });
});

export default app;

