# Stage 1: Build the React application
FROM node:18-alpine as builder

WORKDIR /app

# Set build-time arguments for Vite
ARG VITE_API_URL
ARG VITE_FIREBASE_apiKey
ARG VITE_FIREBASE_authDomain
ARG VITE_FIREBASE_projectId
ARG VITE_FIREBASE_storageBucket
ARG VITE_FIREBASE_messagingSenderId
ARG VITE_FIREBASE_appId
ARG VITE_FIREBASE_measurementId
ARG VITE_RECAPTCHA_SITE_KEY

# Set corresponding environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FIREBASE_apiKey=$VITE_FIREBASE_apiKey
ENV VITE_FIREBASE_authDomain=$VITE_FIREBASE_authDomain
ENV VITE_FIREBASE_projectId=$VITE_FIREBASE_projectId
ENV VITE_FIREBASE_storageBucket=$VITE_FIREBASE_storageBucket
ENV VITE_FIREBASE_messagingSenderId=$VITE_FIREBASE_messagingSenderId
ENV VITE_FIREBASE_appId=$VITE_FIREBASE_appId
ENV VITE_FIREBASE_measurementId=$VITE_FIREBASE_measurementId
ENV VITE_RECAPTCHA_SITE_KEY=$VITE_RECAPTCHA_SITE_KEY

COPY package*.json ./

# Use npm ci for faster, more reliable builds
RUN npm ci

COPY . .

# Vite is more memory-efficient, adjust memory limit
ENV NODE_OPTIONS=--max-old-space-size=1024

# Build the application with Vite
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:stable-alpine

# Vite builds to 'dist' by default
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the Nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for the Nginx server
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
