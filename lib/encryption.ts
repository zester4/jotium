import "server-only";

const ENCRYPTION_SECRET = process.env.API_KEY_ENCRYPTION_SECRET;
if (!ENCRYPTION_SECRET) {
  throw new Error("API_KEY_ENCRYPTION_SECRET env variable is required");
}

const IV_LENGTH = 12; // GCM recommended

// Cache the key to avoid recreating it every time
let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) {
    return cachedKey;
  }

  try {
    const encoder = new TextEncoder();
    const secretBytes = encoder.encode(ENCRYPTION_SECRET);
    
    // Ensure we have a proper crypto implementation
    const cryptoImpl = globalThis.crypto || require('node:crypto').webcrypto;
    
    // Hash using Web Crypto API
    const hashBuffer = await cryptoImpl.subtle.digest('SHA-256', secretBytes);
    
    cachedKey = await cryptoImpl.subtle.importKey(
      "raw",
      hashBuffer,
      "AES-GCM",
      false,
      ["encrypt", "decrypt"]
    );
    
    return cachedKey;
  } catch (error) {
    console.error("Failed to create encryption key:", error);
    throw new Error("Failed to create encryption key");
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
    const key = await getKey();
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

export async function decryptApiKey(encrypted: string): Promise<string> {
  try {
    const cryptoImpl = getCryptoImpl();
    
    // Validate input
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
    
    const key = await getKey();
    
    const decrypted = await cryptoImpl.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedText
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error(`Failed to decrypt API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function encryptOAuthToken(rawToken: string): Promise<string> {
  try {
    const cryptoImpl = getCryptoImpl();
    const iv = cryptoImpl.getRandomValues(new Uint8Array(IV_LENGTH));
    const key = await getKey();
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

export async function decryptOAuthToken(encrypted: string): Promise<string> {
  try {
    const cryptoImpl = getCryptoImpl();
    
    // Validate input
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
    
    const key = await getKey();
    
    const decrypted = await cryptoImpl.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encryptedText
    );
    
    const dec = new TextDecoder();
    return dec.decode(decrypted);
  } catch (error) {
    console.error("OAuth token decryption failed:", error);
    throw new Error(`Failed to decrypt OAuth token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}