# MyCloud Panel - Install Guide

## INSTALAÇÃO NA VPS

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

## Troubleshooting

- **Bancos de dados não sobem:** Verifique se as portas não estão em uso por processos locais (embora o painel use redes internas, conflitos de IP na bridge podem ocorrer).
- **Frontend não acessível:** Confirme se as portas 80/443 estão liberadas no Firewall da sua VPS (UFW / Security Lists da nuvem).
- **HTTPS falhou:** O comando do certbot requer que o DNS já esteja propagado para o IP da VPS. Verifique no ping e tente executar `docker compose exec -T certbot certbot --nginx -d mycloud.cysmk.online` novamente.
- **Limitações ARM64:** O projeto foi projetado utilizando imagens multi-arch, caso sua VPS utilize ARM64 (ex: Oracle Cloud Ampere), os containers buildados localmente e imagens `mysql`, `mongo`, `redis`, `node:20-alpine` devem funcionar nativamente.
