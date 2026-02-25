import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const CLAUDE_CONFIG_PATH = path.join(os.homedir(), ".claude.json");

function profileConfigPath(profileName: string): string {
  return path.join(os.homedir(), `.claude-${profileName}.json`);
}

/** Save current ~/.claude.json as ~/.claude-<name>.json */
export function saveClaudeConfigForProfile(profileName: string): void {
  if (!fs.existsSync(CLAUDE_CONFIG_PATH)) return;
  fs.copyFileSync(CLAUDE_CONFIG_PATH, profileConfigPath(profileName));
}

/** Replace ~/.claude.json with ~/.claude-<name>.json */
export function restoreClaudeConfigForProfile(profileName: string): void {
  const src = profileConfigPath(profileName);
  if (!fs.existsSync(src)) return;
  fs.copyFileSync(src, CLAUDE_CONFIG_PATH);
}

/** Delete ~/.claude-<name>.json */
export function deleteClaudeConfigForProfile(profileName: string): void {
  const p = profileConfigPath(profileName);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
  }
}
