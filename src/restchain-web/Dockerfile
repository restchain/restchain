# Frontend build based on Node.js
#FROM node:10.12.0-alpine as build-stage
#RUN apk update && apk upgrade && apk add --no-cache --virtual .gyp \
#        python \
#        make \
#        git \
#        g++
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app
#ENV PATH /usr/src/app/node_modules/.bin:$PATH
#COPY package.json /usr/src/app/package.json
#RUN yarn install
#RUN yarn global add  react-scripts@latest
#COPY . /usr/src/app
##RUN CI=true npm test
#RUN yarn run build

# Stage 1
# Production build based on Nginx with artifacts from Stage 0
FROM nginx:alpine

# Import of built static content
COPY ./build/ /var/www

# NGINX configuration import
COPY ./ngnix-configuration/default.conf /etc/nginx/conf.d/default.conf
COPY ./ngnix-configuration/nginx.conf /etc/nginx/nginx.conf

# Port where the service will be exposed
EXPOSE 80

# Command to execute the NGNIX Server
CMD ["nginx", "-g", "daemon off;"]
