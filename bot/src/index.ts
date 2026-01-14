import { createClient } from "redis";
import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_BOT_TOKEN, REDIS_URL, MINIAPP_URL } from "./config";
import { messages } from "./i18n";
import { postEventAction } from "./api";

type DueNotificationPayload = {
  notificationId: string;
  userId: string;
  eventId: string;
  type: string;
  telegramId: string;
  title: string;
  startAt: string;
  endAt: string;
};

const bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
  polling: true
});

async function startRedisListener() {
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();

  await redis.subscribe("notifications:due", async (message) => {
    try {
      const payload = JSON.parse(message) as DueNotificationPayload;
      await handleDueNotification(payload);
    } catch (e) {
      console.error("Failed to handle notification", e);
    }
  });
}

async function handleDueNotification(payload: DueNotificationPayload) {
  const locale = "ru";
  const m = messages[locale];

  const startDate = new Date(payload.startAt);

  const textLines = [
    `*${m.notificationTitle}*`,
    ``,
    `*${m.taskNameLabel}:* ${payload.title}`,
    `*${m.dueDateLabel}:* ${startDate.toLocaleString("ru-RU")}`
  ];

  const keyboard = {
    inline_keyboard: [
      [
        {
          text: m.buttons.accept,
          callback_data: `event:${payload.eventId}:accept`
        },
        {
          text: m.buttons.done,
          callback_data: `event:${payload.eventId}:done`
        }
      ],
      [
        {
          text: m.buttons.reschedule,
          callback_data: `event:${payload.eventId}:reschedule`
        }
      ],
      [
        {
          text: m.openInApp,
          url: MINIAPP_URL
        }
      ]
    ]
  };

  await bot.sendMessage(payload.telegramId, textLines.join("\n"), {
    parse_mode: "Markdown",
    reply_markup: keyboard
  });
}

bot.on("callback_query", async (query) => {
  const locale = "ru";
  const m = messages[locale];

  const data = query.data;
  const chatId = query.message?.chat.id;
  const messageId = query.message?.message_id;

  if (!data || !chatId || !messageId) {
    return;
  }

  if (data.startsWith("event:")) {
    const [, eventId, action] = data.split(":");

    try {
      await postEventAction({
        eventId,
        action: action as "accept" | "done" | "reschedule",
        telegramId: String(chatId)
      });

      let text: string;
      if (action === "accept") text = m.accepted;
      else if (action === "done") text = m.completed;
      else text = m.rescheduled;

      await bot.answerCallbackQuery(query.id, { text });
    } catch (e) {
      console.error("Failed to send action to backend", e);
      await bot.answerCallbackQuery(query.id, {
        text: m.actionFailed,
        show_alert: true
      });
    }
  }
});

async function main() {
  console.log("Telegram bot starting with polling...");
  await startRedisListener();
}

main().catch((err) => {
  console.error("Bot failed to start", err);
  process.exit(1);
});

