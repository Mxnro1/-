import crypto from "crypto";

// Валидация initData из Telegram WebApp.
// Согласно документации Telegram: хэш считается по отсортированным параметрам, используя secret key = SHA256(bot_token).

export function validateTelegramInitData(initData: string, botToken: string): boolean {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get("hash");
    if (!hash) return false;

    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      if (key === "hash") return;
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join("\n");

    const secretKey = crypto.createHash("sha256").update(botToken).digest();
    const hmac = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return hmac === hash;
  } catch {
    return false;
  }
}

