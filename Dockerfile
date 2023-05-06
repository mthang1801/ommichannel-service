
FROM node:19.8.1-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm cache clean && npm install --legacy-peer-deps
COPY . .
RUN npm run build --only=builder

FROM node:19.8.1-alpine AS production 
WORKDIR /usr/src/app
COPY . .
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 5000
RUN npm install -g pm2
CMD ["pm2", "start", "ecosystem.config.js"]


