# MyCloud Panel

Professional Full Stack Cloud Administration Panel, designed for VPS deployment via Docker.

## Quick Installation (VPS)

1. Connect to your VPS via SSH (Ubuntu recommended).
2. Install Git if not present: `sudo apt update && sudo apt install -y git`
3. Clone the repository and run the automated installer:

```bash
git clone <SEU_REPOSITORIO_GITHUB> mycloud-panel
cd mycloud-panel
cp .env.example .env

# Optional: Set your own passwords manually, or let the installer generate secure secrets automatically.
nano .env

# Execute the master installation script
sudo ./scripts/install.sh
```

4. Check your deployment status:
```bash
sudo ./scripts/status.sh
sudo ./scripts/healthcheck.sh
```

## Architecture

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, Prisma (MySQL) & Mongoose (MongoDB)
- **Databases:** MySQL (Relational), MongoDB (Document), Redis (Caching/Queues)
- **Reverse Proxy:** Nginx with Let's Encrypt SSL
- **Storage:** Persisted physically to `/opt/mycloud/storage` (to prevent DB bloating).

## Administrative Commands

This panel relies on shell scripts placed in the `scripts/` directory for safe operations:

| Command | Description |
|---|---|
| `sudo ./scripts/install.sh` | Fresh install, generates directories & secrets |
| `sudo ./scripts/start.sh` | Starts all stopped Docker containers |
| `sudo ./scripts/stop.sh` | Safely stops all containers |
| `sudo ./scripts/restart.sh` | Restarts the ecosystem |
| `sudo ./scripts/update.sh` | Pulls from Git, builds, and runs migrations without losing data |
| `sudo ./scripts/backup.sh` | Dumps DBs and compresses storage to `/opt/mycloud/backups` |
| `sudo ./scripts/restore.sh` | Restores a specific backup state (Requires confirmation) |
| `sudo ./scripts/status.sh` | Shows containers, RAM, Disk, CPU |
| `sudo ./scripts/healthcheck.sh` | Verifies DB connections and ping endpoints |
| `sudo ./scripts/logs.sh` | Live tail of system logs |
| `sudo ./scripts/migrate.sh` | Runs Prisma schema deployments |
| `sudo ./scripts/uninstall.sh` | Destructive removal tool (Requires explicit wipe confirmation) |

## Security Highlights
- **No Direct DB Exposure:** Ports `3306`, `27017`, and `6379` are bound strictly to the `private_net` internal docker network and NEVER exposed to `0.0.0.0`.
- **Argon2id Hashing:** Robust mathematical password encryption.
- **RBAC:** Core administration requires the `SUPER_ADMIN` token role.
- **Path Traversal Protection:** Explicit boundaries block arbitrary file reads globally.

## HTTPS (Let's Encrypt)

After `install.sh` completes and your domain (`mycloud.cysmk.online`) A-Record fully propagates:
```bash
docker exec -it mycloud-certbot certbot --nginx -d mycloud.cysmk.online
```

## Troubleshooting
- **Containers crashing?** Check logs using `sudo ./scripts/logs.sh backend` or `sudo ./scripts/logs.sh mysql`.
- **Storage uploads failing?** Ensure permissions are valid over the host folder `sudo chown -R 1000:1000 /opt/mycloud/storage`.
- **Out of space?** Run `docker system prune` and verify `/opt/mycloud/backups` rotations.
