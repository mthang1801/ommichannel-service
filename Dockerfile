ARG SVC_PORT=5000
ARG NODE_IMAGE=node:16
ARG WORKDIR=/usr/src/app

FROM ${NODE_IMAGE} AS builder
WORKDIR ${WORKDIR}
COPY package.json .
RUN npm install 
COPY . .
RUN npm run build --only=builder

FROM ${NODE_IMAGE} AS production 
WORKDIR ${WORKDIR}
COPY --from=builder ${WORKDIR} .
RUN ls 
EXPOSE ${SVC_PORT}
CMD ["npm", "start"]


