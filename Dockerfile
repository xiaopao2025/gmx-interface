FROM node:18-alpine AS builder

WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate

COPY .yarn .yarn

COPY package.json yarn.lock .yarnrc.yml ./

RUN yarn cache clean && yarn install --immutable --check-cache

COPY . .

RUN yarn build

FROM nginx:alpine

RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
