# Use the official Node.js image
FROM node:14  

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your application
COPY . .

# Expose the port the NLP service runs on
EXPOSE 5000

# Command to run the NLP service
CMD ["node", "nlp_service.js"]