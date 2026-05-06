FROM node:18-alpine
RUN apk add --no-cache nginx
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
COPY nginx/default.conf /etc/nginx/http.d/default.conf

# We DO NOT run npm build here. We do it when the container starts.
RUN echo "#!/bin/sh \n npm run build && cp -r build/* /usr/share/nginx/html/ && nginx -g 'daemon off;'" > /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
