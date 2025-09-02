
FROM node:24-alpine

WORKDIR /app

COPY index.js .
COPY lipsum.txt .

EXPOSE 8080

CMD ["node", "index.js"]
