FROM node:18-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install packages
RUN npm ci --legacy-peer-deps

# Copy codebase
COPY . .

# Set environment
ENV NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Build project
RUN npm run build

# Expose Next.js port
EXPOSE 3000

# Start server
CMD ["npm", "run", "start"]
