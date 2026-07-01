# Use Node 20 alpine base image
FROM node:20-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency files first for caching layers
COPY package.json package-lock.json* ./

# Install npm dependencies
RUN npm install

# Copy the entire frontend codebase
COPY . .

# Expose Vite / React default port
EXPOSE 5173

# Run development server with host configuration
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
