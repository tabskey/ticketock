FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM build AS test

CMD ["npm", "run", "test:coverage"]

FROM node:24-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
