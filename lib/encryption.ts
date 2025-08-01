import "server-only";

const PRIMARY_SECRET = process.env.API_KEY_ENCRYPTION_SECRET_PRIMARY;
const SECONDARY_SECRET = process.env.API_KEY_ENCRYPTION_SECRET_SECONDARY;

if (!PRIMARY_SECRET) {
  throw new Error("API_KEY_ENCRYPTION_SECRET_PRIMARY env variable is required");
}

const IV_LENGTH = 12; // GCM recommended

// Cache keys to avoid recreating them every time
let primaryKey: CryptoKey | null = null;
let secondaryKey: CryptoKey | null = null;

async function getKey(type: 'primary' | 'secondary'): Promise<CryptoKey | null> {
  const secret = type === 'primary' ? PRIMARY_SECRET : SECONDARY_SECRET;
  let cachedKey = type === 'primary' ? primaryKey : secondaryKey;

  if (cachedKey) {
    return cachedKey;
  }
  if (!secret) {
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(secret);
    
    const cryptoImpl = getCryptoImpl();
    
    const hashBuffer = await cryptoImpl.subtle.digest('SHA-256', secretBytes);
    
    const key = await cryptoImpl.subtle.importKey(
      "raw",
      hashBuffer,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );

    if (type === 'primary') {
      primaryKey = key;
    } else {
      secondaryKey = key;
    }
    
    return key;
  } catch (error) {
    console.error(`Failed to create ${type} encryption key:`, error);
    throw new Error(`Failed to create ${type} encryption key`);
  }
}

function getCryptoImpl() {
  // Use globalThis.crypto if available (Edge Runtime, modern Node.js)
  // Otherwise fall back to Node.js webcrypto
  return globalThis.crypto || require('node:crypto').webcrypto;
}

export async function encryptApiKey(rawKey: string): Promise<string> {
  try {
    const cryptoImpl = getCryptoImpl();
    const iv = cryptoImpl.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await getKey('primary');
    if (!key) throw new Error("Primary encryption key is not available.");
    const enc = new TextEncoder();
    
    const encrypted = await cryptoImpl.subtle.encrypt(
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
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error(`Failed to encrypt API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function decryptApiKey(encrypted: string): Promise<{ value: string; reEncrypt: boolean }> {
  const cryptoImpl = getCryptoImpl();
  
  if (!encrypted || typeof encrypted !== 'string') {
    throw new Error("Invalid encrypted data: empty or not a string");
  }
  
  let data: Buffer;
  try {
    data = Buffer.from(encrypted, "base64");
  } catch (error) {
    throw new Error("Invalid encrypted data: not valid base64");
  }
  
  if (data.length < IV_LENGTH) {
    throw new Error(`Invalid encrypted data: too short (${data.length} bytes, need at least ${IV_LENGTH})`);
  }
  
  const iv = data.subarray(0, IV_LENGTH);
  const encryptedText = data.subarray(IV_LENGTH);
  
  if (encryptedText.length === 0) {
    throw new Error("Invalid encrypted data: no encrypted content");
  }

  const dec = new TextDecoder();

  // 1. Try decrypting with the primary key
  const primary = await getKey('primary');
  if (primary) {
    try {
      const decrypted = await cryptoImpl.subtle.decrypt({ name: "AES-GCM", iv }, primary, encryptedText);
      return { value: dec.decode(decrypted), reEncrypt: false };
    } catch (e) {
      // Ignore error and try secondary key
    }
  }

  // 2. Try decrypting with the secondary key
  const secondary = await getKey('secondary');
  if (secondary) {
    try {
      const decrypted = await cryptoImpl.subtle.decrypt({ name: "AES-GCM", iv }, secondary, encryptedText);
      // If successful with secondary key, signal that re-encryption is needed
      return { value: dec.decode(decrypted), reEncrypt: true };
    } catch (e) {
      // Ignore error, will throw final error below
    }
  }
  
  // 3. If both fail, throw the final error
  console.error("Decryption failed: Both primary and secondary keys failed.");
  throw new Error("Failed to decrypt API key: All available keys failed.");
}

export async function encryptOAuthToken(rawToken: string): Promise<string> {
  try {
    const cryptoImpl = getCryptoImpl();
    const iv = cryptoImpl.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await getKey('primary');
    if (!key) throw new Error("Primary encryption key is not available.");
    const enc = new TextEncoder();
    
    const encrypted = await cryptoImpl.subtle.encrypt(
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
  } catch (error) {
    console.error("OAuth token encryption failed:", error);
    throw new Error(`Failed to encrypt OAuth token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function decryptOAuthToken(encrypted: string): Promise<{ value: string; reEncrypt: boolean }> {
  const cryptoImpl = getCryptoImpl();
  
  if (!encrypted || typeof encrypted !== 'string') {
    throw new Error("Invalid encrypted data: empty or not a string");
  }
  
  let data: Buffer;
  try {
    data = Buffer.from(encrypted, "base64");
  } catch (error) {
    throw new Error("Invalid encrypted data: not valid base64");
  }
  
  if (data.length < IV_LENGTH) {
    throw new Error(`Invalid encrypted data: too short (${data.length} bytes, need at least ${IV_LENGTH})`);
  }
  
  const iv = data.subarray(0, IV_LENGTH);
  const encryptedText = data.subarray(IV_LENGTH);
  
  if (encryptedText.length === 0) {
    throw new Error("Invalid encrypted data: no encrypted content");
  }

  const dec = new TextDecoder();

  // 1. Try decrypting with the primary key
  const primary = await getKey('primary');
  if (primary) {
    try {
      const decrypted = await cryptoImpl.subtle.decrypt({ name: "AES-GCM", iv }, primary, encryptedText);
      return { value: dec.decode(decrypted), reEncrypt: false };
    } catch (e) {
      // Ignore error and try secondary key
    }
  }

  // 2. Try decrypting with the secondary key
  const secondary = await getKey('secondary');
  if (secondary) {
    try {
      const decrypted = await cryptoImpl.subtle.decrypt({ name: "AES-GCM", iv }, secondary, encryptedText);
      return { value: dec.decode(decrypted), reEncrypt: true };
    } catch (e) {
      // Ignore error, will throw final error below
    }
  }
  
  // 3. If both fail, throw the final error
  console.error("OAuth token decryption failed: Both primary and secondary keys failed.");
  throw new Error("Failed to decrypt OAuth token: All available keys failed.");
}
