# MyCloud Panel - Enterprise v3.0

A secure, high-performance, self-hosted PaaS and Control Plane for modern VPS infrastructure.

## 🚀 Key Features
- **Zero-Config Installation**: Fully automated setup with secure Docker Secrets generation. No `.env` files required.
- **Docker Compose First**: Built entirely around modern Docker architectures with explicit resource limits.
- **Automated Backup & Restore**: Secure physical and logical database dumps managed directly from the CLI.
- **Role-Based Access Control**: Granular roles (`SUPER_ADMIN`, `ADMIN`, `USER`) via Argon2id hashed passwords.
- **Real-Time Host Monitoring**: Embedded `systeminformation` metrics via websockets (CPU, RAM, Disks, Network Rx/Tx).

## 📦 Installation

Installing MyCloud Panel is as simple as cloning the repository and running the automated setup script. 
No manual configuration of passwords or secrets is required.

```bash
git clone https://github.com/frontmkgmx-ai/Front-Net-painel.git
cd Front-Net-painel
sudo ./scripts/install.sh
```

Upon completion, the installer will automatically generate all necessary cryptographic secrets in `/etc/mycloud/secrets` and output your initial Administrator credentials.

## 🔒 Security Architecture
The v3.0 architecture eliminates the need for manual `.env` file management.
- **Docker Secrets**: All cryptographic keys and database passwords are automatically generated and passed natively via Docker Secrets (`/run/secrets/...`).
- **Configuration Persistence**: Non-secret configurations (e.g., Domains) are stored in `/etc/mycloud/config/mycloud.conf`.
- **Physical Storage**: All persistent app volumes (MySQL, MongoDB, Redis, Uploads) are strictly mapped to `/opt/mycloud/`.

## 🛠 Management Commands
The `scripts/` directory provides complete lifecycle management tools. All scripts must be run via `sudo`.

- `sudo ./scripts/update.sh` - Auto-backs up your data, pulls the latest code, and rebuilds containers without data loss.
- `sudo ./scripts/backup.sh` - Creates full encrypted archives of DBs and secrets in `/opt/mycloud/backups`.
- `sudo ./scripts/restore.sh <path>` - Interactively restores a previous state.
- `sudo ./scripts/doctor.sh` - Validates the health of your VPS, Docker Daemon, and generated secrets.
- `sudo ./scripts/status.sh` - Returns the `docker ps` state of your PaaS.
