FROM node:20-alpine

WORKDIR /app

# Cache bust: v4-fix-double-start
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

ENV TRANSPORT=http
ENV PORT=3000

EXPOSE 3000

CMD ["node", "dist/index.js"]
