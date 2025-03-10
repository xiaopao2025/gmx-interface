FROM node:22 AS builder
WORKDIR /app

RUN corepack enable && corepack prepare yarn@stable --activate

COPY . .
RUN yarn && yarn husky install && yarn build

FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
