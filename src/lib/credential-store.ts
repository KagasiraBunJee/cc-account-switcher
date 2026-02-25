import fs from "node:fs";
import { CAS_DIR, PROFILES_PATH } from "./config.js";
import { encrypt, decrypt } from "./encryption.js";
import { getOrCreateEncryptionKey } from "./keychain.js";
import type { CasConfig, ClaudeCredentials } from "../types.js";

function ensureCasDir(): void {
  if (!fs.existsSync(CAS_DIR)) {
    fs.mkdirSync(CAS_DIR, { mode: 0o700, recursive: true });
  }
}

export function loadConfig(): CasConfig {
  ensureCasDir();

  if (!fs.existsSync(PROFILES_PATH)) {
    return { activeProfile: null, profiles: {} };
  }

  const raw = fs.readFileSync(PROFILES_PATH, "utf8");
  return JSON.parse(raw) as CasConfig;
}

export function saveConfig(config: CasConfig): void {
  ensureCasDir();

  const data = JSON.stringify(config, null, 2);
  fs.writeFileSync(PROFILES_PATH, data, { mode: 0o600 });
}

export async function saveProfile(
  name: string,
  credentials: ClaudeCredentials,
  meta: { email?: string; org?: string }
): Promise<void> {
  const config = loadConfig();
  const key = await getOrCreateEncryptionKey();
  const encrypted = encrypt(JSON.stringify(credentials), key);

  const now = new Date().toISOString();
  const existing = config.profiles[name];

  config.profiles[name] = {
    name,
    email: meta.email ?? existing?.email,
    org: meta.org ?? existing?.org,
    encryptedCredentials: encrypted.ciphertext,
    iv: encrypted.iv,
    authTag: encrypted.authTag,
    createdAt: existing?.createdAt ?? now,
    lastUsedAt: now,
  };

  config.activeProfile = name;
  saveConfig(config);
}

export async function getProfileCredentials(
  name: string
): Promise<ClaudeCredentials> {
  const config = loadConfig();
  const profile = config.profiles[name];

  if (!profile) {
    throw new Error(`Profile "${name}" not found`);
  }

  const key = await getOrCreateEncryptionKey();
  const decrypted = decrypt(
    {
      ciphertext: profile.encryptedCredentials,
      iv: profile.iv,
      authTag: profile.authTag,
    },
    key
  );

  return JSON.parse(decrypted) as ClaudeCredentials;
}

export function deleteProfile(name: string): void {
  const config = loadConfig();

  if (!config.profiles[name]) {
    throw new Error(`Profile "${name}" not found`);
  }

  delete config.profiles[name];

  if (config.activeProfile === name) {
    const remaining = Object.keys(config.profiles);
    config.activeProfile = remaining.length > 0 ? remaining[0] : null;
  }

  saveConfig(config);
}

export function profileExists(name: string): boolean {
  const config = loadConfig();
  return name in config.profiles;
}
