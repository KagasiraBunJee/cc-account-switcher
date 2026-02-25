# CAS — Claude Account Switcher

Switch between multiple Claude CLI accounts instantly. No more `claude auth logout` + `claude auth login` every time.

## How It Works

Claude CLI stores OAuth credentials in the macOS Keychain and account metadata in `~/.claude.json`. CAS manages named profiles — each storing a snapshot of both — and swaps them when you switch.

## Requirements

- **macOS** (uses Keychain for credential storage)
- **Node.js 20+**
- **Claude CLI** installed and working

## Installation

```bash
git clone https://github.com/KagasiraBunJee/cc-account-switcher.git
cd cc-account-switcher
bash install.sh
```

The installer will:
1. Check prerequisites (Node.js, npm, Claude CLI)
2. Install dependencies and build
3. Link `cas` globally
4. Optionally add shell integration to your `~/.zshrc`

### Manual Installation

```bash
git clone https://github.com/KagasiraBunJee/cc-account-switcher.git
cd cc-account-switcher
npm install
npm run build
npm link
```

## Quick Start

```bash
# Add your first account
cas add work
# → Opens browser for Claude login

# Add another account
cas add personal
# → Opens browser for Claude login

# Switch between them
cas switch work
cas switch personal

# See all profiles
cas list

# Show active profile
cas current
```

## Commands

| Command | Description |
|---|---|
| `cas add <name>` | Login and save a new profile |
| `cas switch <name>` | Switch to a different profile |
| `cas list` | List all profiles |
| `cas current` | Show the active profile |
| `cas remove <name>` | Remove a profile (`--force` if active) |
| `cas setup-shell` | Print shell integration function |

## Shell Integration (Optional)

Adds `claude --use-account <name>` support so you can switch inline:

```bash
# Add to ~/.zshrc or ~/.bashrc
eval "$(cas setup-shell)"
```

Then use:

```bash
claude --use-account work "explain this code"
```

This runs `cas switch work` before launching Claude.

## Security

- Credentials are **encrypted at rest** (AES-256-GCM) in `~/.cas/profiles.json`
- Encryption key is stored in macOS Keychain
- `~/.cas/profiles.json` is created with `0600` permissions
- All keychain access uses `execFile` (no shell injection)

## Uninstall

```bash
npm unlink -g cc-account-switcher
rm -rf ~/.cas
rm -f ~/.claude-*.json
```
