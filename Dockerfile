# Use official Node image
FROM node:18-alpine

# Create app directory inside container
WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy entire source code
COPY . .

# Expose backend port
EXPOSE 5000

# Start server
CMD ["npm", "run", "dev"]