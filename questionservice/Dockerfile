# Use official Node.js image
FROM node:22

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install --only=production

# Copy the rest of the app files
COPY . .

# Expose the service port
EXPOSE 8004

# Start the service
CMD ["node", "quest-service.js"]