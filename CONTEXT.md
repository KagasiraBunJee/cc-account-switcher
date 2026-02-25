# CAS — Claude Account Switcher

## What It Does
CLI tool that manages named profiles for Claude CLI, allowing instant account switching without repeated `claude auth logout` + `claude auth login`. Stores encrypted OAuth credentials per profile and swaps macOS Keychain entries.

## Current Status
**Phase: Functional MVP — ready for manual testing**

All core features implemented and building successfully:
- `cas add <name>` — interactive login + save profile
- `cas switch <name>` — swap keychain credentials
- `cas list` — show all profiles (active marked with `*`)
- `cas remove <name>` — delete a profile (`--force` for active)
- `cas current` — show active profile
- `cas setup-shell` — print shell function for `~/.zshrc`
- `install.sh` — local installer script

Not yet tested end-to-end with actual account switching (only build + CLI output verified).

## Project Structure
```
cas/
  package.json          # cc-account-switcher, ESM, bin → ./bin/cas.js
  tsconfig.json         # ES2022, bundler resolution
  tsup.config.ts        # ESM build, target node20
  install.sh            # Local installer (preflight checks, npm install/build/link)
  .gitignore
  bin/cas.js            # #!/usr/bin/env node shim
  shell/cas.sh          # Shell function for --use-account interception
  src/
    index.ts            # CLI entry (commander)
    types.ts            # ClaudeCredentials, OAuthTokens, Profile, CasConfig
    commands/
      add.ts, switch.ts, list.ts, remove.ts, current.ts, setup-shell.ts
    lib/
      config.ts         # Paths (~/.cas/), keychain service names
      keychain.ts       # macOS keychain via `security` CLI
      encryption.ts     # AES-256-GCM encrypt/decrypt
      credential-store.ts  # Manage ~/.cas/profiles.json
      claude-cli.ts     # Spawn claude auth commands
```

## Key Technical Details

### Claude CLI Credential Format
Stored in macOS Keychain under service `"Claude Code-credentials"`, account = OS username.
```json
{
  "claudeAiOauth": {
    "accessToken": "sk-ant-oat01-...",
    "refreshToken": "sk-ant-ort01-...",
    "expiresAt": 1772044842644,
    "scopes": ["user:inference", "user:mcp_servers", "user:profile", "user:sessions:claude_code"],
    "subscriptionType": "pro",
    "rateLimitTier": "default_claude_ai"
  }
}
```

### `claude auth status` Output
Returns JSON:
```json
{
  "loggedIn": true,
  "authMethod": "claude.ai",
  "apiProvider": "firstParty",
  "email": "user@example.com",
  "orgId": "...",
  "orgName": "...'s Organization",
  "subscriptionType": "pro"
}
```

### Security Model
- Credentials encrypted with AES-256-GCM in `~/.cas/profiles.json` (mode 0600)
- Encryption key stored in keychain under service `"cas-encryption-key"`
- All keychain access via `execFile` (no shell injection)
- macOS only (uses `security` CLI)

## Dependencies
- `commander` ^12.1.0 — CLI parsing
- `chalk` ^5.3.0 — colored output
- Dev: `typescript`, `tsup`, `vitest`, `@types/node`

## Build & Install
```bash
npm install && npm run build   # Build
npm link                       # Global install
bash install.sh                # Or use installer script
```

## Bugs Fixed
1. **Credential parsing** — initially assumed flat `{accessToken, refreshToken}`, but Claude CLI wraps in `{claudeAiOauth: {...}}`. Fixed in `keychain.ts` and `types.ts`.
2. **Auth status parsing** — initially used regex on text output, but `claude auth status` returns JSON. Fixed in `claude-cli.ts`.

## TODO
- [ ] End-to-end test: `cas add` two profiles, `cas switch` between them
- [ ] Shell integration test: `claude --use-account <name>`
- [ ] Update `REPO_URL` in `install.sh` to actual GitHub repo before publishing
- [ ] Consider npm publish for public distribution
- [ ] Linux support (via `secret-tool` backend)
- [ ] Unit tests with vitest
