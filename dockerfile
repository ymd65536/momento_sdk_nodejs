FROM node:16
WORKDIR /usr/src/app
COPY package*.json ./
COPY index.js ./
RUN npm install
ENV MOMENTO_AUTH_TOKEN=${MOMENTO_AUTH_TOKEN}
CMD [ "node","index.js" ]
