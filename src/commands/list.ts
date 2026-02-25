import chalk from "chalk";
import { loadConfig } from "../lib/credential-store.js";

export function listCommand(): void {
  const config = loadConfig();
  const profiles = Object.values(config.profiles);

  if (profiles.length === 0) {
    console.log(chalk.yellow("No profiles configured."));
    console.log(chalk.dim('Run "cas add <name>" to add a profile.'));
    return;
  }

  console.log(chalk.bold("Profiles:\n"));

  for (const profile of profiles) {
    const isActive = profile.name === config.activeProfile;
    const marker = isActive ? chalk.green("* ") : "  ";
    const name = isActive
      ? chalk.green.bold(profile.name)
      : chalk.white(profile.name);
    const email = profile.email ? chalk.dim(` (${profile.email})`) : "";
    const org = profile.org ? chalk.dim(` [${profile.org}]`) : "";

    console.log(`${marker}${name}${email}${org}`);
  }

  console.log("");
  console.log(chalk.dim(`${profiles.length} profile(s) total`));
}
