# Installation Guide

## Requirements
- Ubuntu 20.04 or 22.04 LTS (x86_64 or ARM64)
- At least 2GB RAM (4GB+ recommended)
- Root or sudo privileges
- A domain name pointed to your server's IP (e.g. `mycloud.cysmk.online`)

## Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mycloud-panel.git
   cd mycloud-panel
   ```

2. Run the interactive installer:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```

3. The installer will:
   - Install Docker & Docker Compose (if missing)
   - Create the `.env` file with secure random passwords
   - Create necessary storage directories at `/opt/mycloud/storage`
   - Start the Docker containers

4. Access the panel:
   Open your browser and navigate to your domain or server IP.
   Check the `.env` file for your initial admin credentials.

## Setting up SSL (HTTPS)

The `docker-compose.yml` includes an Nginx reverse proxy and Certbot.
To generate an SSL certificate, ensure your domain points to the server IP and run:

```bash
docker exec -it mycloud-certbot certbot --nginx -d mycloud.cysmk.online
```
