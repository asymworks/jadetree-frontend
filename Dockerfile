# build stage
FROM node:lts-alpine3.14 as build-stage
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

# production stage
FROM nginx:1.20-alpine as production-stage
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build-stage /app/dist /app
COPY docker/config.json /app
ENV JADETREE_API_HOST backend
ENV JADETREE_API_PORT 5000
ENV JADETREE_API_PATH /api/v1
ENV JADETREE_API_SCHEME http
ENV JADETREE_WS_PATH /socket.io
EXPOSE 80
