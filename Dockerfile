FROM node:18-slim

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code and configuration
COPY tsconfig.json ./
COPY src/ ./src/

# Build the TypeScript code
RUN npm run build

# Cleanup to reduce image size
RUN npm prune --production

# Set executable permission for the server
RUN chmod +x dist/server.js

# Use non-root user for better security
USER node

# Run the MCP server
CMD ["node", "dist/server.js"]