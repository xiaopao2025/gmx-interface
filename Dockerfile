FROM node:22 AS builder
WORKDIR /app

# Install build essentials
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare yarn@stable --activate
#COPY .yarn .yarn
#COPY package.json yarn.lock .yarnrc.yml ./

#RUN yarn cache clean && yarn install --immutable

COPY . .
RUN yarn install && yarn build

FROM nginx:alpine
RUN rm -rf /etc/nginx/conf.d/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
