# Stage 1: Build React app
FROM node:18 AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

RUN npm run build

# Stage 2: Serve static files with nginx
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

COPY --from=build /app/build .

# Copy custom nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]