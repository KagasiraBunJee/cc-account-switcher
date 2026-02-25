# CAS - Claude Account Switcher shell integration
# Add to your ~/.zshrc or ~/.bashrc:
#   eval "$(cas setup-shell)"

claude() {
  local account="" args=()
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --use-account)
        account="$2"
        shift 2
        ;;
      --use-account=*)
        account="${1#*=}"
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
  command claude "${args[@]}"
}
