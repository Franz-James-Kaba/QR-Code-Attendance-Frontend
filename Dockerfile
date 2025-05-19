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

# Stage 2: Serve the app using a Node.js server
FROM node:20-alpine

# Install 'serve' to serve static files
RUN npm install -g serve

# Create directory for app
WORKDIR /app

# Copy the built Angular app from the builder stage
COPY --from=builder /app/dist/qr-code-attendance-frontend/browser/ /app

# Expose port 4200 for the app (if you want to serve it on port 4200)
EXPOSE 4200

# Run the app with 'serve' on port 4200
CMD ["serve", "-s", ".", "-l", "4200"]
