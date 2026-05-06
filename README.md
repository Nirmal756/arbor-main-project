# React Enterprise: Generic ECR Deployment Pipeline

This project implements a **Build-Once, Deploy-Anywhere** CI/CD strategy. The React application is not pre-compiled during the CI process; instead, it is built **inside the container at runtime** on the target EC2 instance. This allows a single image from ECR to serve different environments based on the local `.env` file provided via Docker Compose.

---

## 🚀 Key Features
- **Generic Images**: ECR images contain source code/dependencies but no hardcoded variables.
- **Late-Binding Env**: Environment variables are injected from the EC2 host at startup.
- **Nginx Integration**: Automated serving of build assets via internal Nginx.
- **Permission Fix**: Automated GitHub Runner workspace cleanup to handle `sudo` file locks.

---

## 🏗 System Architecture



1. **GitHub Actions**: Cleans workspace, builds a generic image (raw code + node_modules), and pushes to ECR.
2. **EC2 Deployment**: Docker Compose pulls the image and injects a local `.env.dev` (Dev) or `.env.prod` (Prod).
3. **Runtime Build**: Upon container start, the entrypoint script executes `npm run build` using that specific instance's variables.
4. **Nginx**: Static assets are moved to the web directory and served immediately.

---
## Port Configuration

sudo systemctl stop nginx && sudo systemctl disable nginx

📄 Core Implementation Files

Dockerfile(Runtime Build Logic)

FROM node:18-alpine

# Install Nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Install dependencies (Baked into image for speed)
COPY package*.json ./
RUN npm install

# Copy raw source code
COPY . .

# Copy Nginx configuration for Alpine
COPY nginx/default.conf /etc/nginx/http.d/default.conf

# Entrypoint script: Runs on the EC2 at container startup
RUN printf "#!/bin/sh\n\
set -e\n\
echo '--- STARTING REACT BUILD ---'\n\
npm run build\n\
echo '--- BUILD FINISHED ---'\n\
mkdir -p /usr/share/nginx/html\n\
cp -r build/* /usr/share/nginx/html/\n\
echo '--- STARTING NGINX ---'\n\
nginx -g \"daemon off;\"" > /entrypoint.sh

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]




Docker Compose Configuration



version: '3.8'
services:
  web:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    env_file:
      - .env.dev  # Change to .env.prod on the Production instance
    ports:
      - "80:80"
    restart: always




Here is the complete, consolidated project guide. You can copy this entire block and save it as README.md in your project root. It includes the architecture, the specific Dockerfile logic we used, the AWS fixes, and the workflow steps.

Markdown
# React Enterprise: Generic ECR Deployment Pipeline

This project implements a **Build-Once, Deploy-Anywhere** CI/CD strategy. The React application is not pre-compiled during the CI process; instead, it is built **inside the container at runtime** on the target EC2 instance. This allows a single image from ECR to serve different environments based on the local `.env` file provided via Docker Compose.

---

## 🚀 Key Features
- **Generic Images**: ECR images contain source code/dependencies but no hardcoded variables.
- **Late-Binding Env**: Environment variables are injected from the EC2 host at startup.
- **Nginx Integration**: Automated serving of build assets via internal Nginx.
- **Permission Fix**: Automated GitHub Runner workspace cleanup to handle `sudo` file locks.

---

## 🏗 System Architecture



1. **GitHub Actions**: Cleans workspace, builds a generic image (raw code + node_modules), and pushes to ECR.
2. **EC2 Deployment**: Docker Compose pulls the image and injects a local `.env.dev` (Dev) or `.env.prod` (Prod).
3. **Runtime Build**: Upon container start, the entrypoint script executes `npm run build` using that specific instance's variables.
4. **Nginx**: Static assets are moved to the web directory and served immediately.

---

## 🛠 Prerequisites (EC2 Setup)

1. Port Configuration
Disable host-level Nginx to allow Docker to bind to Port 80:

Bash
sudo systemctl stop nginx && sudo systemctl disable nginx
📄 Core Implementation Files
Dockerfile (Runtime Build Logic)
Dockerfile
FROM node:18-alpine

# Install Nginx
RUN apk add --no-cache nginx

WORKDIR /app

# Install dependencies (Baked into image for speed)
COPY package*.json ./
RUN npm install

# Copy raw source code
COPY . .

# Copy Nginx configuration for Alpine
COPY nginx/default.conf /etc/nginx/http.d/default.conf

# Entrypoint script: Runs on the EC2 at container startup
RUN printf "#!/bin/sh\n\
set -e\n\
echo '--- STARTING REACT BUILD ---'\n\
npm run build\n\
echo '--- BUILD FINISHED ---'\n\
mkdir -p /usr/share/nginx/html\n\
cp -r build/* /usr/share/nginx/html/\n\
echo '--- STARTING NGINX ---'\n\
nginx -g \"daemon off;\"" > /entrypoint.sh

RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
Docker Compose Configuration
YAML
version: '3.8'
services:
  web:
    image: ${ECR_REGISTRY}/${ECR_REPOSITORY}:${IMAGE_TAG}
    env_file:
      - .env.dev  # Change to .env.prod on the Production instance
    ports:
      - "80:80"
    restart: always



🚀 Deployment Workflow


1: Push to Dev: A generic image is built and pushed to ECR. Dev EC2 pulls it and builds the app using the local .env.dev.

2: Merge to Main: The exact same image is pulled on the Prod EC2 and builds the app using the local .env.prod.


Verification


Since the build happens after the container starts, the site will not be live immediately. It usually takes 60-90 seconds to compile. Monitor progress via:

sudo docker logs -f <container_name>
