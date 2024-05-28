# Use the official Node.js image as a base
FROM node:21-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
#RUN rm -rf node_modules
RUN npm install

# Install TypeScript and ts-node-dev
RUN npm install -g typescript sequelize reflect-metadata sequelize-typescript ts-node nodemon

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application with nodemon  "--watch", ".",
#CMD ["ts-node-dev", "--respawn", "--transpile-only", "--watch", "src", "src/index.ts"]
CMD ["nodemon", "--exec", "ts-node", "src/index.ts"]