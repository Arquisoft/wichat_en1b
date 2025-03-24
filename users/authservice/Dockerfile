# Use an official Node.js runtime as a parent image
FROM node:22

RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory in the container
WORKDIR /usr/src/authservice

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install app dependencies
    # RUN npm install
RUN npm install --build-from-source bcrypt

# Copy the app source code to the working directory
    # COPY . .
COPY users/authservice/ .
COPY models/ ../../models/

# Expose the port the app runs on
EXPOSE 8002

# Define the command to run your app
CMD ["node", "auth-service.js"]
