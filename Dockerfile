FROM node:16

WORKDIR /app

COPY package.json package-lock.json server.js .

RUN npm ci --omit=dev

COPY src src

ENTRYPOINT ["npm", "start"]
