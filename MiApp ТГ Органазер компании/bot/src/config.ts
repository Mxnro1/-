import dotenv from "dotenv";
dotenv.config();

export const TELEGRAM_BOT_TOKEN =
  process.env.TELEGRAM_BOT_TOKEN || "CHANGE_ME_BOT_TOKEN";

export const BACKEND_BASE_URL =
  process.env.BACKEND_BASE_URL || "http://localhost:4000";

export const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// URL Mini App (для кнопок "Открыть в приложении")
export const MINIAPP_URL =
  process.env.MINIAPP_URL || "https://t.me/your_bot/miniapp";

