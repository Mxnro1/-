import axios from "axios";
import { BACKEND_BASE_URL } from "./config";

const client = axios.create({
  baseURL: BACKEND_BASE_URL,
  timeout: 5000
});

// TODO: продумать отдельный сервисный токен для бота и валидацию на backend.

export async function postEventAction(params: {
  eventId: string;
  action: "accept" | "done" | "reschedule";
  telegramId: string;
}) {
  const { eventId, action, telegramId } = params;
  await client.post("/bot/events/action", {
    eventId,
    action,
    telegramId
  });
}

