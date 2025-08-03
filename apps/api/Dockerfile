FROM node:18-alpine

WORKDIR /app

# Copy all package files
COPY package*.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/sdk/package.json ./packages/sdk/

# Install all dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Change to the api directory
WORKDIR /app/apps/api

# Build the TypeScript code
RUN npm run build

# Expose the port
EXPOSE 3001

# Start the application
CMD [ "node", "dist/index.js" ]