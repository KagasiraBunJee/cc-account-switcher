import chalk from "chalk";
import { loadConfig, deleteProfile, profileExists } from "../lib/credential-store.js";
import { deleteClaudeConfigForProfile } from "../lib/claude-config.js";

export function removeCommand(
  name: string,
  options: { force?: boolean }
): void {
  if (!profileExists(name)) {
    console.error(chalk.red(`Profile "${name}" not found.`));
    process.exit(1);
  }

  const config = loadConfig();
  const isActive = config.activeProfile === name;

  if (isActive && !options.force) {
    console.error(
      chalk.red(
        `Profile "${name}" is the active profile. Use --force to remove it.`
      )
    );
    process.exit(1);
  }

  deleteProfile(name);
  deleteClaudeConfigForProfile(name);

  console.log(chalk.green(`Profile "${name}" removed.`));

  if (isActive) {
    const updated = loadConfig();
    if (updated.activeProfile) {
      console.log(
        chalk.dim(`Active profile switched to "${updated.activeProfile}".`)
      );
    } else {
      console.log(chalk.yellow("No active profile. Add one with \"cas add <name>\"."));
    }
  }
}
