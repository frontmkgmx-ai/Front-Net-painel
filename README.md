# MyCloud Panel

Professional Full Stack Cloud Administration Panel, designed for VPS deployment via Docker.

## Architecture

- **Frontend:** React 19, TypeScript, Vite, TailwindCSS
- **Backend:** Node.js, Express, Prisma (MySQL) & Mongoose (MongoDB)
- **Databases:** MySQL (Relational), MongoDB (Document), Redis (Caching/Queues)
- **Reverse Proxy:** Nginx with Let's Encrypt SSL ready
- **Storage:** Persisted physically to `/opt/mycloud/storage`

## INSTALAÇÃO RÁPIDA NA VPS

1. Conecte-se à sua VPS via SSH (Ubuntu 24.04 LTS ou compatível, amd64/arm64).
2. Clone o repositório e execute a instalação automática:

```bash
git clone <URL_DO_REPOSITORIO>
cd <PASTA_DO_PROJETO>

cp .env.example .env

# Opcional: Edite manualmente ou deixe o instalador gerar os secrets automaticamente
nano .env

# Execute o instalador master
sudo ./scripts/install.sh
```

3. Verifique o status da implantação:
```bash
sudo ./scripts/status.sh
sudo ./scripts/healthcheck.sh
```

## Comandos Administrativos

| Comando | Descrição |
|---|---|
| `sudo ./scripts/install.sh` | Instalação do zero, gera diretórios & secrets |
| `sudo ./scripts/start.sh` | Inicia todos os containers |
| `sudo ./scripts/stop.sh` | Para todos os containers com segurança |
| `sudo ./scripts/restart.sh` | Reinicia o ecossistema |
| `sudo ./scripts/update.sh` | Atualiza repositório, builda e executa migrations sem perda de dados |
| `sudo ./scripts/backup.sh` | Dump de bancos e compactação de arquivos para `/opt/mycloud/backups` |
| `sudo ./scripts/restore.sh` | Restaura a partir de um backup específico |
| `sudo ./scripts/status.sh` | Exibe consumo de CPU, RAM, Disco e Containers |
| `sudo ./scripts/healthcheck.sh` | Verifica conexões internas do banco e da API |
| `sudo ./scripts/logs.sh` | Live tail dos logs (pode passar o nome do container, ex: `backend`) |
| `sudo ./scripts/migrate.sh` | Executa migrations do Prisma |
| `sudo ./scripts/uninstall.sh` | Remoção da plataforma (Exige confirmação para exclusão de dados) |

## Segurança
- **Bancos Isolados:** Portas 3306, 27017 e 6379 ficam restritas à rede interna `private_net`.
- **Criptografia de Senha:** Uso de `Argon2id` para máxima resistência.
- **RBAC:** Sistema de permissões escalonado.
- **Sanitização de Paths:** Proteção contra `../` (Path Traversal) no módulo de storage.

## Configuração HTTPS (Let's Encrypt)
Após propagar o IP no DNS para `mycloud.cysmk.online`:
```bash
docker compose exec -T certbot certbot --nginx -d mycloud.cysmk.online
```
*(Descomente a seção SSL no `docker/nginx/conf.d/default.conf` e faça restart)*
