# Dockerfile

# Use Node.js image
FROM node:14

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application
COPY . .

# Expose the port
EXPOSE 3000


# Command to run the application
CMD ["node", "api_gateway.js"]
