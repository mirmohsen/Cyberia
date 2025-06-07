# Use a secure Node image with no critical or high vulnerabilities
FROM node:24-slim

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your app
COPY . .

# Build your TypeScript app
RUN npm run build

# Expose the port your app runs on
EXPOSE 3000

# Start the app
CMD ["node", "dist/index.js"]
