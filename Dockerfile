
FROM node:16.20.0 AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --force
COPY . .
RUN npm run build --only=builder

FROM node:16.20.0 AS production 
WORKDIR /usr/src/app
COPY . .
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 5000
RUN npm install -g pm2
CMD ["pm2", "start", "ecosystem.config.js"]


