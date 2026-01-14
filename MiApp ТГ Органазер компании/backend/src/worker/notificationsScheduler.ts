import dotenv from "dotenv";
dotenv.config();

import { createClient } from "redis";
import { prisma } from "../lib/prisma";

// Простой планировщик уведомлений на Redis + периодический поллер.
// TODO: заменить на более надёжный job-раннер при необходимости.

async function main() {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const redis = createClient({ url: redisUrl });
  await redis.connect();

  // Простейший поллинг БД по расписанию
  setInterval(async () => {
    const now = new Date();
    const dueNotifications = await prisma.notification.findMany({
      where: {
        sentAt: null,
        scheduledAt: { lte: now },
      },
      include: {
        user: true,
        event: true,
      },
      take: 50,
    });

    for (const n of dueNotifications) {
      if (!n.user.telegramId) {
        // Нечему отправлять — пользователь не привязан к Telegram.
        continue;
      }

      const payload = JSON.stringify({
        notificationId: n.id,
        userId: n.userId,
        eventId: n.eventId,
        type: n.type,
        telegramId: n.user.telegramId,
        title: n.event.title,
        startAt: n.event.startAt,
        endAt: n.event.endAt,
      });

      // Публикуем событие в Redis-канал, который будет читать сервис бота
      await redis.publish("notifications:due", payload);

      await prisma.notification.update({
        where: { id: n.id },
        data: { sentAt: now },
      });
    }
  }, 5000);
}

main().catch((err) => {
  console.error("Notifications scheduler failed", err);
  process.exit(1);
});

