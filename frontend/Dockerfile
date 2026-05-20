FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=http://localhost:8080
ARG VITE_PURCHASES_WHATSAPP_NUMBER=59165900645
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_PURCHASES_WHATSAPP_NUMBER=${VITE_PURCHASES_WHATSAPP_NUMBER}

RUN npm run build

FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist ./

EXPOSE 80
