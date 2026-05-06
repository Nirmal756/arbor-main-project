FROM node:18-alpine

RUN apk add --no-cache nginx

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

COPY nginx/default.conf /etc/nginx/http.d/default.conf

RUN printf "#!/bin/sh\n\
set -e\n\
echo '--- STARTING RUNTIME BUILD ---'\n\
npm run build\n\
mkdir -p /usr/share/nginx/html\n\
cp -r build/* /usr/share/nginx/html/\n\
echo '--- STARTING NGINX ---'\n\
nginx -g \"daemon off;\"" > /entrypoint.sh

RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
