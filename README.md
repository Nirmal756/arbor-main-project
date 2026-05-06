React Enterprise Deployment Pipeline

Generic Build & Runtime Environment Injection

1. Project Overview
This project implements a robust, "Build-Once, Deploy-Anywhere" CI/CD pipeline for a
React application. The core innovation is a Late-Binding Runtime Strategy. This allows a
single, generic Docker image to be used for both Development and Production
environments, injecting specific configurations only when the container starts on the
target AWS EC2 instance.
Core Tech Stack
Frontend: React.js
CI/CD: GitHub Actions + Self-Hosted Runners (on EC2)
Registry: Amazon Elastic Container Registry (ECR)
Orchestration: Docker Compose
Web Server: Nginx (Alpine-based)

2. Key Challenges Solved
Permission Denied (EACCES): Fixed by implementing a mandatory workspace
cleanup step in GitHub Actions to handle files created by sudo .
Baking vs. Injection: Solved the issue where React env variables were hard-coded
during build. We moved npm run build into the container's startup script.
Memory Crashes (t2.micro): Resolved "Restarting (255)" errors by implementing
Linux Swap space to handle memory-heavy React builds.
Port Conflicts: Resolved "Address already in use" by disabling host-level Nginx
services.
•
•
•
•
•

•

•

•

•

3. Environment Setup
AWS Infrastructure
Create a repository named nirmal/react-app in ECR. Set up two Ubuntu EC2 instances
with GitHub Self-hosted runners. Ensure Security Groups allow inbound traffic on Port 80.

Mandatory for t2.micro: Add Swap Space
Building React requires ~1GB+ RAM. Run these commands on your EC2 instances:
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo mkswap /swapfile && sudo swapon /swapfile

Local Configuration
Create environment files locally on each EC2 instance in the project directory:
Dev Instance: .env.dev
Prod Instance: .env.prod

4. Deployment Workflow
Phase 1: Development (Branch: dev)
1. Push to dev. 2. Generic Image built and pushed to ECR. 3. docker-compose.dev.yml
pulls image and injects .env.dev .
Phase 2: Production (Branch: main)

1. Merge to main. 2. GitHub pulls existing latest image from ECR. 3. docker-
compose.prod.yml injects .env.prod and triggers runtime build.

5. Technical Implementation
The Generic Dockerfile
•
•

FROM node:18-alpine
RUN apk add --no-cache nginx
WORKDIR /app

6. Troubleshooting Guide

Symptom Diagnosis Solution
Permission
denied

Root-owned files in
workspace

sudo rm -rf ${{
github.workspace }}/*
Restarting (255) Out of Memory (OOM) Add Swap Space (1-2GB)
Port in use Host Nginx conflict sudo systemctl stop nginx

Note: After deployment, monitor the build via sudo docker logs -f [container_id] .
The site will be live once the internal "npm run build" completes.
COPY package*.json ./
RUN npm install
COPY . .
COPY nginx/default.conf /etc/nginx/http.d/default.conf
RUN printf "#!/bin/sh\nset -e\nnpm run build\nmkdir -p /usr/share/nginx/
html\ncp -r build/* /usr/share/nginx/html/\nnginx -g \"daemon off;\"" > /
entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
