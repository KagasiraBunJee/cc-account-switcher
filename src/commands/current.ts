import chalk from "chalk";
import { loadConfig } from "../lib/credential-store.js";

export function currentCommand(): void {
  const config = loadConfig();

  if (!config.activeProfile) {
    console.log(chalk.yellow("No active profile."));
    console.log(chalk.dim('Run "cas add <name>" to add a profile.'));
    return;
  }

  const profile = config.profiles[config.activeProfile];
  if (!profile) {
    console.log(
      chalk.yellow(`Active profile "${config.activeProfile}" not found in config.`)
    );
    return;
  }

  console.log(chalk.bold(profile.name));
  if (profile.email) {
    console.log(chalk.dim(`Email: ${profile.email}`));
  }
  if (profile.org) {
    console.log(chalk.dim(`Org: ${profile.org}`));
  }
  console.log(chalk.dim(`Last used: ${profile.lastUsedAt}`));
}
