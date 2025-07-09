import crypto from "crypto";

const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("API_KEY_ENCRYPTION_SECRET env variable is required");
}
const ENCRYPTION_SECRET_STR: string = ENCRYPTION_SECRET;

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended

export function encryptApiKey(rawKey: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.createHash("sha256").update(ENCRYPTION_SECRET_STR).digest();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(rawKey, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

export function decryptApiKey(encrypted: string): string {
  const data = Buffer.from(encrypted, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + 16);
  const encryptedText = data.subarray(IV_LENGTH + 16);
  const key = crypto.createHash("sha256").update(ENCRYPTION_SECRET_STR).digest();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString("utf8");
} 