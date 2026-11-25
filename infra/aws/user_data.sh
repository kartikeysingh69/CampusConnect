#!/usr/bin/env bash
# ==============================================================================
# infra/aws/user_data.sh — Automated EC2 Bootstrap & Container Runner
# ==============================================================================

set -e

# 1. Update OS Packages
dnf update -y

# 2. Install Docker, Git, and Libs
dnf install -y docker git

# 3. Start and enable Docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# 4. Install Docker Compose plugin
DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
mkdir -p $DOCKER_CONFIG/cli-plugins
curl -SL https://github.com/docker/compose/releases/download/v2.29.1/docker-compose-linux-x86_64 -o $DOCKER_CONFIG/cli-plugins/docker-compose
chmod +x $DOCKER_CONFIG/cli-plugins/docker-compose

# 5. Clone repository or download docker-compose
mkdir -p /opt/campusconnect
cd /opt/campusconnect

cat << 'EOF' > docker-compose.prod.yml
services:
  db:
    image: mysql:8.4
    container_name: campusconnect-mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: campusconnect
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  backend:
    image: ghcr.io/kartikeysingh69/campusconnect-backend:latest
    container_name: campusconnect-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      DB_HOST: db
      DB_USER: root
      DB_PASSWORD: root
      DB_NAME: campusconnect
      JWT_SECRET: campusconnect_cloud_prod_key_2026
    ports:
      - "5000:5000"
    depends_on:
      - db

  frontend:
    image: ghcr.io/kartikeysingh69/campusconnect-frontend:latest
    container_name: campusconnect-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
EOF

# 6. Pull and Launch production containers from GHCR
docker compose -f docker-compose.prod.yml pull || true
docker compose -f docker-compose.prod.yml up -d || true

echo "CampusConnect Cloud Server Bootstrap Complete!" > /var/log/campusconnect-init.log
