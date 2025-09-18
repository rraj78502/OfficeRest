# Stage 1: Build the frontend app
FROM node:18 AS builder

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:8000

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Create .env file with the build argument
RUN echo "VITE_API_URL=${VITE_API_URL}" > .env

# Build for production
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built files from previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

COPY default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for nginx
EXPOSE 80

# Start nginx server
CMD ["nginx", "-g", "daemon off;"]

