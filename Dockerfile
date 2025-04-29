# Stage 1: Build the Angular app
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Install global Angular CLI
RUN npm install -g @angular/cli@19.1.0

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the app's source code
COPY . .

# Build the Angular app
RUN ng build --configuration production

# Stage 2: Run the app with a non-root user
FROM nginx:stable-alpine

# Create a non-root user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app from builder stage
COPY --from=builder /app/dist/ /usr/share/nginx/html

# Set ownership to non-root user
RUN chown -R appuser:appgroup /usr/share/nginx/html

# Switch to non-root user
USER appuser

# Expose default port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
