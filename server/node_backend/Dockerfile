# Use a standard Node.js image
FROM node:20

# Set the folder inside the container
WORKDIR /app

# Copy  package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all  backend code into the container
COPY . .

CMD ["node", "server.js"]