
FROM node:19.8.1-alpine AS builder
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install --force
COPY . .
RUN npm run build --only=builder

FROM node:19.8.1-alpine AS production 
WORKDIR /usr/src/app
COPY . .
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 5000
CMD ["node", "dist/main"]


