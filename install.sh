#!/usr/bin/env bash
set -euo pipefail

# CAS — Claude Account Switcher installer
# Usage: bash install.sh

INSTALL_DIR="${CAS_INSTALL_DIR:-$HOME/.cas-cli}"
REPO_URL="https://github.com/KagasiraBunJee/claude-account-switcher.git"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

info()  { echo -e "${BOLD}$*${RESET}"; }
ok()    { echo -e "${GREEN}✓ $*${RESET}"; }
warn()  { echo -e "${YELLOW}! $*${RESET}"; }
fail()  { echo -e "${RED}✗ $*${RESET}"; exit 1; }

# ── Preflight checks ──────────────────────────────────────────────

info "\nCAS — Claude Account Switcher installer\n"

# macOS only (keychain dependency)
if [[ "$(uname -s)" != "Darwin" ]]; then
  fail "CAS currently supports macOS only (uses Keychain for credential storage)."
fi

# Node.js >= 20
if ! command -v node &>/dev/null; then
  fail "Node.js is required but not installed. Install it from https://nodejs.org"
fi

NODE_MAJOR=$(node -e "process.stdout.write(String(process.versions.node.split('.')[0]))")
if [[ "$NODE_MAJOR" -lt 20 ]]; then
  fail "Node.js 20+ required (found v$(node -v)). Please upgrade."
fi
ok "Node.js v$(node -v | tr -d 'v') detected"

# npm
if ! command -v npm &>/dev/null; then
  fail "npm is required but not installed."
fi
ok "npm $(npm -v) detected"

# Claude CLI (warn only — user might install it later)
if command -v claude &>/dev/null; then
  ok "Claude CLI detected"
else
  warn "Claude CLI not found — install it before using CAS"
fi

# ── Install ────────────────────────────────────────────────────────

# Check if this script is running from within the project directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [[ -f "$SCRIPT_DIR/package.json" ]] && grep -q '"claude-account-switcher"' "$SCRIPT_DIR/package.json" 2>/dev/null; then
  info "\nInstalling from local source: $SCRIPT_DIR"
  INSTALL_DIR="$SCRIPT_DIR"
else
  # Clone from remote
  if [[ -d "$INSTALL_DIR" ]]; then
    info "\nUpdating existing installation at $INSTALL_DIR..."
    cd "$INSTALL_DIR"
    git pull --ff-only 2>/dev/null || {
      warn "git pull failed — reinstalling fresh"
      rm -rf "$INSTALL_DIR"
      git clone "$REPO_URL" "$INSTALL_DIR"
    }
  else
    info "\nCloning CAS to $INSTALL_DIR..."
    git clone "$REPO_URL" "$INSTALL_DIR"
  fi
fi

cd "$INSTALL_DIR"

info "Installing dependencies..."
npm install --no-fund --no-audit 2>&1 | tail -1
ok "Dependencies installed"

info "Building..."
npm run build 2>&1 | tail -2
ok "Build complete"

# Global link
info "Linking globally..."
npm link 2>&1 | tail -1
ok "cas command linked"

# Verify
if command -v cas &>/dev/null; then
  ok "cas is now available globally"
else
  # npm global bin might not be in PATH
  NPM_BIN="$(npm prefix -g)/bin"
  warn "cas installed but not in PATH. Add this to your shell profile:"
  echo -e "  ${DIM}export PATH=\"$NPM_BIN:\$PATH\"${RESET}"
fi

# ── Shell integration ──────────────────────────────────────────────

echo ""
info "Shell integration (optional)"
echo -e "${DIM}This adds the 'claude --use-account <name>' shortcut.${RESET}"
echo ""

SHELL_RC=""
if [[ -n "${ZSH_VERSION:-}" ]] || [[ "$SHELL" == */zsh ]]; then
  SHELL_RC="$HOME/.zshrc"
elif [[ -n "${BASH_VERSION:-}" ]] || [[ "$SHELL" == */bash ]]; then
  SHELL_RC="$HOME/.bashrc"
fi

SHELL_LINE='eval "$(cas setup-shell)"'

if [[ -n "$SHELL_RC" ]]; then
  if grep -qF "$SHELL_LINE" "$SHELL_RC" 2>/dev/null; then
    ok "Shell integration already in $SHELL_RC"
  else
    read -rp "Add shell integration to $SHELL_RC? [Y/n] " answer
    answer="${answer:-Y}"
    if [[ "$answer" =~ ^[Yy]$ ]]; then
      echo "" >> "$SHELL_RC"
      echo "# CAS — Claude Account Switcher" >> "$SHELL_RC"
      echo "$SHELL_LINE" >> "$SHELL_RC"
      ok "Added to $SHELL_RC — restart your shell or run: source $SHELL_RC"
    else
      echo -e "  ${DIM}To add manually later:${RESET}"
      echo -e "  ${DIM}echo '$SHELL_LINE' >> $SHELL_RC${RESET}"
    fi
  fi
else
  echo -e "  ${DIM}Add this to your shell profile:${RESET}"
  echo -e "  ${DIM}$SHELL_LINE${RESET}"
fi

# ── Done ───────────────────────────────────────────────────────────

echo ""
info "Installation complete!"
echo ""
echo -e "  ${BOLD}Quick start:${RESET}"
echo -e "    cas add personal     ${DIM}# login and save a profile${RESET}"
echo -e "    cas add work         ${DIM}# login with another account${RESET}"
echo -e "    cas switch personal  ${DIM}# switch accounts${RESET}"
echo -e "    cas list             ${DIM}# see all profiles${RESET}"
echo ""
