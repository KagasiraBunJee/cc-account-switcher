import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import {
  CLAUDE_KEYCHAIN_SERVICE,
  CLAUDE_KEYCHAIN_ACCOUNT,
  CAS_KEY_SERVICE,
  CAS_KEY_ACCOUNT,
} from "./config.js";
import type { ClaudeCredentials } from "../types.js";

const execFileAsync = promisify(execFile);

async function keychainFind(
  service: string,
  account: string
): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("security", [
      "find-generic-password",
      "-s",
      service,
      "-a",
      account,
      "-w",
    ]);
    return stdout.trim();
  } catch {
    return null;
  }
}

async function keychainSet(
  service: string,
  account: string,
  value: string
): Promise<void> {
  // Delete existing entry first (ignore errors if not found)
  try {
    await execFileAsync("security", [
      "delete-generic-password",
      "-s",
      service,
      "-a",
      account,
    ]);
  } catch {
    // Ignore — entry may not exist
  }

  await execFileAsync("security", [
    "add-generic-password",
    "-s",
    service,
    "-a",
    account,
    "-w",
    value,
    "-U",
  ]);
}

async function keychainDelete(
  service: string,
  account: string
): Promise<void> {
  try {
    await execFileAsync("security", [
      "delete-generic-password",
      "-s",
      service,
      "-a",
      account,
    ]);
  } catch {
    // Ignore — entry may not exist
  }
}

export async function getClaudeCredentials(): Promise<ClaudeCredentials | null> {
  const raw = await keychainFind(
    CLAUDE_KEYCHAIN_SERVICE,
    CLAUDE_KEYCHAIN_ACCOUNT
  );
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    // Claude CLI stores as { claudeAiOauth: { accessToken, refreshToken, ... } }
    if (parsed.claudeAiOauth?.accessToken && parsed.claudeAiOauth?.refreshToken) {
      return parsed as ClaudeCredentials;
    }
    return null;
  } catch {
    return null;
  }
}

export async function setClaudeCredentials(
  credentials: ClaudeCredentials
): Promise<void> {
  const value = JSON.stringify(credentials);
  await keychainSet(CLAUDE_KEYCHAIN_SERVICE, CLAUDE_KEYCHAIN_ACCOUNT, value);
}

export async function clearClaudeCredentials(): Promise<void> {
  await keychainDelete(CLAUDE_KEYCHAIN_SERVICE, CLAUDE_KEYCHAIN_ACCOUNT);
}

export async function getOrCreateEncryptionKey(): Promise<Buffer> {
  const existing = await keychainFind(CAS_KEY_SERVICE, CAS_KEY_ACCOUNT);
  if (existing) {
    return Buffer.from(existing, "hex");
  }

  const key = randomBytes(32);
  await keychainSet(CAS_KEY_SERVICE, CAS_KEY_ACCOUNT, key.toString("hex"));
  return key;
}
