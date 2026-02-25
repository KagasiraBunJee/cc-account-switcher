import chalk from "chalk";
import {
  getClaudeCredentials,
  setClaudeCredentials,
} from "../lib/keychain.js";
import {
  loadConfig,
  saveConfig,
  saveProfile,
  getProfileCredentials,
  profileExists,
} from "../lib/credential-store.js";
import {
  saveClaudeConfigForProfile,
  restoreClaudeConfigForProfile,
} from "../lib/claude-config.js";

export async function switchCommand(name: string): Promise<void> {
  if (!profileExists(name)) {
    console.error(chalk.red(`Profile "${name}" not found.`));
    const config = loadConfig();
    const profiles = Object.keys(config.profiles);
    if (profiles.length > 0) {
      console.error(
        chalk.dim(`Available profiles: ${profiles.join(", ")}`)
      );
    }
    process.exit(1);
  }

  const config = loadConfig();

  if (config.activeProfile === name) {
    console.log(chalk.yellow(`Already using profile "${name}".`));
    return;
  }

  // Save current keychain credentials + .claude.json to the active profile
  // (tokens may have been refreshed since last switch)
  const currentCreds = await getClaudeCredentials();
  if (currentCreds && config.activeProfile) {
    saveClaudeConfigForProfile(config.activeProfile);
    await saveProfile(config.activeProfile, currentCreds, {});
  }

  // Decrypt target profile credentials and write to keychain
  const targetCreds = await getProfileCredentials(name);
  await setClaudeCredentials(targetCreds);

  // Restore target profile's ~/.claude.json
  restoreClaudeConfigForProfile(name);

  // Update active profile (reload config since saveProfile modified it)
  const freshConfig = loadConfig();
  freshConfig.activeProfile = name;
  freshConfig.profiles[name].lastUsedAt = new Date().toISOString();
  saveConfig(freshConfig);

  const profile = freshConfig.profiles[name];
  console.log(chalk.green(`Switched to profile "${name}".`));
  if (profile.email) {
    console.log(chalk.dim(`  Email: ${profile.email}`));
  }
  if (profile.org) {
    console.log(chalk.dim(`  Org: ${profile.org}`));
  }
}
