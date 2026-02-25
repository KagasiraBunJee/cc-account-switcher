import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export interface AuthStatus {
  email?: string;
  org?: string;
  authenticated: boolean;
}

export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    const { stdout } = await execFileAsync("claude", ["auth", "status"], {
      timeout: 15_000,
    });

    // Claude CLI outputs JSON: { loggedIn, email, orgName, ... }
    const parsed = JSON.parse(stdout);
    return {
      authenticated: parsed.loggedIn === true,
      email: parsed.email,
      org: parsed.orgName,
    };
  } catch {
    return { authenticated: false };
  }
}

export function triggerLogin(): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("claude", ["auth", "login"], {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`claude auth login exited with code ${code}`));
      }
    });

    child.on("error", (err) => {
      reject(
        new Error(
          `Failed to run claude auth login: ${err.message}. Is Claude CLI installed?`
        )
      );
    });
  });
}
