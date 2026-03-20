# Use the official Node.js image
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all your backend code
COPY . .

# IMPORTANT: Use 'node' instead of 'nodemon' for production
CMD ["node", "server.js"]