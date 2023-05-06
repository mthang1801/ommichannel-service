ARG SVC_PORT=5000
ARG NODE_IMAGE=19.8.1-alpine
ARG WORKDIR=/usr/src/app

FROM ${NODE_IMAGE} AS builder
WORKDIR ${WORKDIR}
COPY package*.json .
RUN npm install 
COPY . .
RUN npm run build --only=builder

FROM ${NODE_IMAGE} AS production 
WORKDIR ${WORKDIR}
COPY --from=builder ${WORKDIR}/dist ./dist
EXPOSE ${SVC_PORT}
CMD ["node", "dist/main"]


