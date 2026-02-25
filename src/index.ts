import { Command } from "commander";
import { addCommand } from "./commands/add.js";
import { switchCommand } from "./commands/switch.js";
import { listCommand } from "./commands/list.js";
import { removeCommand } from "./commands/remove.js";
import { currentCommand } from "./commands/current.js";
import { setupShellCommand } from "./commands/setup-shell.js";

const program = new Command();

program
  .name("cas")
  .description("Claude Account Switcher — manage multiple Claude CLI profiles")
  .version("1.0.0");

program
  .command("add")
  .description("Add a new Claude account profile")
  .argument("<name>", "Profile name")
  .action(async (name: string) => {
    await addCommand(name);
  });

program
  .command("switch")
  .description("Switch to a different profile")
  .argument("<name>", "Profile name to switch to")
  .action(async (name: string) => {
    await switchCommand(name);
  });

program
  .command("list")
  .description("List all profiles")
  .action(() => {
    listCommand();
  });

program
  .command("remove")
  .description("Remove a profile")
  .argument("<name>", "Profile name to remove")
  .option("-f, --force", "Force removal of active profile")
  .action((name: string, options: { force?: boolean }) => {
    removeCommand(name, options);
  });

program
  .command("current")
  .description("Show the active profile")
  .action(() => {
    currentCommand();
  });

program
  .command("setup-shell")
  .description("Print shell integration function (eval in your .zshrc)")
  .action(() => {
    setupShellCommand();
  });

program.parse();
