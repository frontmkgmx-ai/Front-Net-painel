# MyCloud Panel Documentation

MyCloud Panel is a professional infrastructure and file management control panel designed for VPS deployments.

## Architecture

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript, Prisma (MySQL)
- **Databases:** MySQL (Relational), MongoDB (Document), Redis (Cache & Queue)
- **Infrastructure:** Docker & Docker Compose
- **Web Server / Proxy:** Nginx (with Let's Encrypt SSL via Certbot)

## Installation

See `INSTALL.md` for detailed installation instructions on Ubuntu.

## Features

- Complete Role-Based Access Control (SUPER_ADMIN, ADMIN, USER)
- Real-time system monitoring
- MySQL, MongoDB, and Redis management
- Docker container monitoring
- Cloud Storage file management with Chunked Uploads
- Audit logging for administrative actions
- Secure authentication with Argon2 password hashing and JWT
