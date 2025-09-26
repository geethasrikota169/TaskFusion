# Stage 1: Build the application
FROM node:18-alpine
WORKDIR /app

# THE FIX: Renamed the variable to what Vite expects (VITE_ instead of REACT_APP_)
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application using Nginx
FROM nginx:stable-alpine
COPY --from=0 /app/dist /usr/share/nginx/html

# This line copies our custom Nginx config to solve SPA routing issues
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

