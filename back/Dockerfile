FROM node:20-alpine

RUN apk add --no-cache netcat-openbsd
RUN apk add --no-cache openssl
WORKDIR /back
COPY package.json ./
RUN npm install
COPY . .
RUN chmod +x ./start.sh
EXPOSE 3001
CMD ["sh", "./start.sh"]