import path from "node:path";
import os from "node:os";

export const CAS_DIR = path.join(os.homedir(), ".cas");
export const PROFILES_PATH = path.join(CAS_DIR, "profiles.json");

export const CLAUDE_KEYCHAIN_SERVICE = "Claude Code-credentials";
export const CLAUDE_KEYCHAIN_ACCOUNT = os.userInfo().username;

export const CAS_KEY_SERVICE = "cas-encryption-key";
export const CAS_KEY_ACCOUNT = "cas";
