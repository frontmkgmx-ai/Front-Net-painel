# Installation Guide

MyCloud Panel provides an automated, idempotent script that configures everything needed for a secure deployment on a fresh Linux VPS (Ubuntu/Debian recommended).

## Requirements
- **OS:** Ubuntu 22.04+ or Debian 11+
- **Architecture:** x86_64 or ARM64
- **RAM:** Minimum 2GB (1.5GB available)
- **User:** Root privileges (or `sudo`)

## 1. Quick Install
SSH into your server and run:

```bash
git clone https://github.com/frontmkgmx-ai/Front-Net-painel.git
cd Front-Net-painel
sudo ./scripts/install.sh
```

**What the installer does automatically:**
1. Checks memory and architecture constraints.
2. Installs required base dependencies (`curl`, `git`, `openssl`).
3. Installs Docker and Docker Compose if missing.
4. Generates a secure configuration directory (`/etc/mycloud/config`).
5. Generates high-entropy Docker Secrets in `/etc/mycloud/secrets`.
6. Downloads Docker images and orchestrates the containers.
7. Triggers initial Prisma Database migrations.
8. Prints your initial randomized Admin credentials.

*Note: You do NOT need to create or edit a `.env` file manually. Everything is architecturally decoupled from the source tree.*

## 2. Upgrading Existing Installations (Legacy `.env` Migration)
If you are upgrading from an older version of MyCloud Panel that relied on an `.env` file, simply run `sudo ./scripts/install.sh`. 

The installer will detect the legacy `.env` file, extract your existing passwords/salts, migrate them into the new encrypted `/etc/mycloud/secrets` architecture, and rename the old file to `.env.bak` to prevent accidental exposure. No data will be lost.

## 3. Post-Installation Configuration
Once the script succeeds:
1. Navigate to your server's IP or Domain in the browser (`http://YOUR_SERVER_IP`).
2. Log in using the Admin credentials printed at the end of the script.
3. Access the `Admin Dashboard` to change your password and manage applications.
