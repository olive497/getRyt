FROM node:22-alpine

ENV NODE_ENV=production
ENV PORT=7860

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node . .

USER node

EXPOSE 7860

CMD ["npm", "start"]
