# Use the official Node.js image as a base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application to the working directory
COPY . .

# Build the React application
RUN npm run build

# Install a simple web server to serve the build output
RUN npm install -g serve

# Command to run the web server
CMD ["serve", "-s", "build"]

# Expose port 3000
EXPOSE 3000
