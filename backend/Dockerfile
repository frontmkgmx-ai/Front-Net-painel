FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache python3 make g++
RUN npm install
COPY . .
RUN npm run build
RUN npm run prisma:generate

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["npm", "start"]
