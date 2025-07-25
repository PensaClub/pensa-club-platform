# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app

# Set build-time arguments
ARG TEST
ARG REACT_APP_API_URL
ARG REACT_APP_FIREBASE_apiKey
ARG REACT_APP_FIREBASE_authDomain
ARG REACT_APP_FIREBASE_projectId
ARG REACT_APP_FIREBASE_storageBucket
ARG REACT_APP_FIREBASE_messagingSenderId
ARG REACT_APP_FIREBASE_appId
ARG REACT_APP_FIREBASE_measurementId
ARG REACT_APP_RECAPTCHA_SITE_KEY

COPY package*.json ./

RUN npm install

COPY . .

# Move fonts to the src directory to be bundled by Webpack
RUN mkdir -p src/assets && mv public/fonts src/assets/fonts

# Increase memory limit for the build process
ENV NODE_OPTIONS=--max-old-space-size=1536

RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
