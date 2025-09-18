# Stage 1: Build the frontend app
FROM node:18 AS builder

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Create .env file with the build argument
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

