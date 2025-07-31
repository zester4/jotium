import "server-only";

const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("API_KEY_ENCRYPTION_SECRET env variable is required");
}
const ENCRYPTION_SECRET_STR: string = ENCRYPTION_SECRET;

const IV_LENGTH = 12; // GCM recommended

async function getKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(ENCRYPTION_SECRET_STR),
    "AES-GCM",
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptApiKey(rawKey: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getKey();
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(rawKey)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv, 0);
  result.set(encryptedArray, iv.length);

  return Buffer.from(result).toString("base64");
}

export async function decryptApiKey(encrypted: string): Promise<string> {
  const data = Buffer.from(encrypted, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const encryptedText = data.subarray(IV_LENGTH);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedText
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}

export async function encryptOAuthToken(rawToken: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await getKey();
  const enc = new TextEncoder();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    enc.encode(rawToken)
  );

  const encryptedArray = new Uint8Array(encrypted);
  const result = new Uint8Array(iv.length + encryptedArray.length);
  result.set(iv, 0);
  result.set(encryptedArray, iv.length);

  return Buffer.from(result).toString("base64");
}

export async function decryptOAuthToken(encrypted: string): Promise<string> {
  const data = Buffer.from(encrypted, "base64");
  const iv = data.subarray(0, IV_LENGTH);
  const encryptedText = data.subarray(IV_LENGTH);
  const key = await getKey();
  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encryptedText
  );
  const dec = new TextDecoder();
  return dec.decode(decrypted);
}
