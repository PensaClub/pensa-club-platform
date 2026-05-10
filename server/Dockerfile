# Use an official Node.js runtime as a parent image
# Node 20 (LTS) — required because undici 7+ uses the global File class
# which only exists in Node 20+. Node 18 went EOL in April 2025 anyway.
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Make port 8080 available to the world outside this container
EXPOSE 8080

# Define the command to run the app
CMD [ "npm", "start" ]
