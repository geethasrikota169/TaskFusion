# Use an official Node.js runtime as a parent image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# This declares a build-time argument that we can pass in from our CI/CD pipeline
ARG REACT_APP_BACKEND_URL

# This sets the argument as an environment variable so the 'npm run build' command can see it
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application's source code
COPY . .

# This command will now see the REACT_APP_BACKEND_URL and bake it into the static files
RUN npm run build

# Use a lightweight web server to serve the static files
FROM nginx:stable-alpine

# Copy the built assets from the previous stage
COPY --from=0 /app/dist /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Command to run the nginx server
CMD ["nginx", "-g", "daemon off;"]
