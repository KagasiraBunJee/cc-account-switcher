import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function setupShellCommand(): void {
  // Resolve the shell script bundled with the package
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const shellScriptPath = path.resolve(__dirname, "..", "shell", "cas.sh");

  if (fs.existsSync(shellScriptPath)) {
    const script = fs.readFileSync(shellScriptPath, "utf8");
    process.stdout.write(script);
  } else {
    // Fallback: output the shell function inline
    process.stdout.write(SHELL_FUNCTION);
  }
}

const SHELL_FUNCTION = `
# CAS - Claude Account Switcher shell integration
claude() {
  local account="" args=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --use-account)
        account="$2"
        shift 2
        ;;
      --use-account=*)
        account="\${1#*=}"
        shift
        ;;
      *)
        args+=("$1")
        shift
        ;;
    esac
  done
  if [[ -n "$account" ]]; then
    command cas switch "$account" || return $?
  fi
  command claude "\${args[@]}"
}
`;
