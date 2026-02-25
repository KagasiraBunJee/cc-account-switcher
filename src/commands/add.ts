import chalk from "chalk";
import {
  getClaudeCredentials,
  setClaudeCredentials,
  clearClaudeCredentials,
} from "../lib/keychain.js";
import {
  loadConfig,
  profileExists,
  saveProfile,
} from "../lib/credential-store.js";
import { getAuthStatus, triggerLogin } from "../lib/claude-cli.js";
import {
  saveClaudeConfigForProfile,
  restoreClaudeConfigForProfile,
} from "../lib/claude-config.js";

export async function addCommand(name: string): Promise<void> {
  if (profileExists(name)) {
    console.error(chalk.red(`Profile "${name}" already exists.`));
    console.error(
      chalk.dim(`Use "cas remove ${name}" first, or choose a different name.`)
    );
    process.exit(1);
  }

  // Save current credentials + .claude.json to the active profile before clearing
  const config = loadConfig();
  const currentCreds = await getClaudeCredentials();
  if (currentCreds && config.activeProfile) {
    console.log(
      chalk.dim(
        `Saving current state for profile "${config.activeProfile}"...`
      )
    );
    saveClaudeConfigForProfile(config.activeProfile);
    await saveProfile(config.activeProfile, currentCreds, {});
  }

  // Clear keychain so claude auth login starts fresh
  console.log(chalk.dim("Clearing current credentials..."));
  await clearClaudeCredentials();

  // Run interactive login
  console.log(chalk.blue("\nStarting Claude login flow..."));
  console.log(chalk.dim("Complete the login in your browser.\n"));

  try {
    await triggerLogin();
  } catch (err) {
    console.error(
      chalk.red(
        `\nLogin failed: ${err instanceof Error ? err.message : String(err)}`
      )
    );

    // Restore previous credentials if login failed
    if (currentCreds) {
      await setClaudeCredentials(currentCreds);
    }
    if (config.activeProfile) {
      restoreClaudeConfigForProfile(config.activeProfile);
    }
    process.exit(1);
  }

  // Read the newly written credentials
  const newCreds = await getClaudeCredentials();
  if (!newCreds) {
    console.error(chalk.red("\nNo credentials found after login."));

    // Restore previous credentials
    if (currentCreds) {
      await setClaudeCredentials(currentCreds);
    }
    if (config.activeProfile) {
      restoreClaudeConfigForProfile(config.activeProfile);
    }
    process.exit(1);
  }

  // Get account metadata
  const status = await getAuthStatus();

  // Save ~/.claude.json snapshot for the new profile (login updated it)
  saveClaudeConfigForProfile(name);

  // Save the new profile
  await saveProfile(name, newCreds, {
    email: status.email,
    org: status.org,
  });

  console.log(chalk.green(`\nProfile "${name}" added and set as active.`));
  if (status.email) {
    console.log(chalk.dim(`  Email: ${status.email}`));
  }
  if (status.org) {
    console.log(chalk.dim(`  Org: ${status.org}`));
  }
}
