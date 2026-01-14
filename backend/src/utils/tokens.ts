import crypto from "crypto";

export function generateRandomToken(lengthBytes = 32): string {
  return crypto.randomBytes(lengthBytes).toString("hex");
}

