#!/usr/bin/env bash
# ==============================================================================
# scripts/setup_linux.sh — CampusConnect Linux Environment Initializer
# Supported OS: Ubuntu 22.04 / 24.04 LTS, Debian 12
# Installs: Node.js 22 LTS, MySQL Server 8.4, Git, build tools, UFW firewall
# ==============================================================================

set -euo pipefail
IFS=$'\n\t'

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
  echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️ $1${NC}"
}

err() {
  echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌ $1${NC}" >&2
}

info() {
  echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ℹ️ $1${NC}"
}

# Require root/sudo
if [ "$EUID" -ne 0 ]; then
  err "This setup script must be run as root or with sudo."
  exit 1
fi

info "Starting CampusConnect Linux Foundations Provisioning..."

# 1. Update OS Package Index
log "Updating APT package index..."
apt-get update -y && apt-get upgrade -y

# 2. Essential CLI & Networking Utilities
log "Installing foundational Linux utilities (curl, git, ufw, jq, htop)..."
apt-get install -y curl wget git build-essential ufw htop jq unzip software-properties-common

# 3. Node.js 22 LTS Installation via NodeSource
if ! command -v node &> /dev/null; then
  log "Installing Node.js 22 LTS from NodeSource..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
else
  info "Node.js already installed: $(node -v)"
fi

# 4. MySQL Server 8 Installation
if ! command -v mysql &> /dev/null; then
  log "Installing MySQL Server..."
  apt-get install -y mysql-server
  systemctl enable mysql
  systemctl start mysql
else
  info "MySQL Server already installed."
fi

# 5. Security & Firewall (UFW)
log "Configuring UFW Firewall..."
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 5000/tcp # Backend API
# Note: MySQL port 3306 is kept local-only for security
echo "y" | ufw enable || true

# 6. Create CampusConnect Directory Structure
log "Setting up /opt/campusconnect directories and permissions..."
mkdir -p /opt/campusconnect
mkdir -p /var/log/campusconnect
mkdir -p /var/backups/campusconnect

# 7. Configure Linux Kernel Parameters (File limits for high-concurrency Node.js)
log "Optimizing system file limits (sysctl & limits.conf)..."
cat << 'EOF' > /etc/security/limits.d/campusconnect.conf
* soft nofile 65536
* hard nofile 65536
root soft nofile 65536
root hard nofile 65536
EOF

sysctl -w fs.file-max=2097152 > /dev/null || true

log "=========================================================="
log "🎉 CampusConnect Linux Foundations setup completed successfully!"
log "Node.js Version: $(node -v)"
log "NPM Version:     $(npm -v)"
log "Git Version:     $(git --version)"
log "MySQL Status:    $(systemctl is-active mysql || echo 'inactive')"
log "=========================================================="
