# Pet Accessories E-commerce Platform with AWS ECS Deployment

![Project Banner](docs/images/project-banner.png)

A modern, containerized e-commerce platform featuring automated CI/CD with GitHub Actions and deployment to Amazon ECS. This project implements a complete DevOps pipeline for a pet accessories online store, built with React, Node.js, and MongoDB.

[![GitHub Actions CI/CD](https://github.com/franklynux/ecommerce-platform-practice/actions/workflows/deploy.yml/badge.svg)](https://github.com/yourusername/ecommerce-platform/actions/workflows/ci-cd.yml)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![AWS ECR](https://img.shields.io/badge/AWS-ECR-orange.svg)](https://aws.amazon.com/ecr/)

## Table of Contents

- [Pet Accessories E-commerce Platform with AWS ECS Deployment](#pet-accessories-e-commerce-platform-with-aws-ecs-deployment)
  - [Table of Contents](#table-of-contents)
  - [Architecture Overview](#architecture-overview)
  - [Prerequisites](#prerequisites)
  - [Project Structure](#project-structure)
  - [Local Development Setup](#local-development-setup)
  - [Docker Configuration](#docker-configuration)
    - [Backend Docker Configuration](#backend-docker-configuration)
    - [Frontend Docker Configuration](#frontend-docker-configuration)
  - [AWS ECS Setup](#aws-ecs-setup)
    - [Create ECS Cluster](#create-ecs-cluster)
    - [Task Definition](#task-definition)
    - [Create ECS Service](#create-ecs-service)
  - [GitHub Actions Workflow](#github-actions-workflow)
    - [Environment Setup](#environment-setup)
    - [Build and Push Process](#build-and-push-process)
  - [Security Implementation](#security-implementation)
    - [IAM Roles and Permissions](#iam-roles-and-permissions)
    - [Network Security](#network-security)
    - [Application Security](#application-security)
  - [Performance Optimization](#performance-optimization)
    - [Container Optimization](#container-optimization)
    - [Application Performance](#application-performance)
    - [Monitoring Performance](#monitoring-performance)
  - [Monitoring and Observability](#monitoring-and-observability)
    - [CloudWatch Integration](#cloudwatch-integration)
    - [Accessing Container Logs](#accessing-container-logs)
      - [Using AWS Management Console](#using-aws-management-console)
    - [Accessing Deployed Containers](#accessing-deployed-containers)
      - [Quick Access Guide](#quick-access-guide)
      - [Frontend Container (Port 80)](#frontend-container-port-80)
      - [Backend Container (Port 5000)](#backend-container-port-5000)
    - [Monitoring Deployed Containers](#monitoring-deployed-containers)
      - [CloudWatch Logs Access](#cloudwatch-logs-access)
    - [Container Health Verification](#container-health-verification)
    - [Alerting](#alerting)
  - [Troubleshooting Guide](#troubleshooting-guide)
    - [Common Issues](#common-issues)
    - [Debug Procedures](#debug-procedures)
    - [Logging Best Practices](#logging-best-practices)
  - [Contributing](#contributing)
  - [License](#license)

## Architecture Overview

![Architecture Diagram](docs/images/architecture/system-architecture.png)
*System Architecture Overview*

The platform consists of:

- **Frontend**: React application with Tailwind CSS
- **Backend**: Node.js/Express REST API
- **Database**: MongoDB
- **Containerization**: Docker with multi-stage builds
- **CI/CD**: GitHub Actions
- **Cloud Platform**: AWS ECR/ECS
- **Reverse Proxy**: Nginx

## Prerequisites

- Node.js (v18+)
- Docker and Docker Compose
- AWS CLI configured
- GitHub account
- MongoDB instance

## Project Structure

![Project Structure](docs/images/project/folder-structure.png)
*Project Directory Structure Overview*

```plaintext
ecommerce-platform/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── frontend/
│   ├── Dockerfile
│   └── nginx/
│       └── default.conf
├── backend/
│   └── Dockerfile
├── docker/
│   ├── docker-compose.yml
│   └── nginx.conf
└── .aws/
    └── task-definition.json
```

## Local Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ecommerce-platform.git
   cd ecommerce-platform
   ```

2. Set up environment variables:

   ```bash
   # Frontend (.env)
   VITE_API_URL=http://localhost:5000/api

   # Backend (.env)
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   ```

3. Start the development servers:

   ```bash
   # Using Docker Compose
   docker-compose up -d

   # Without Docker
   cd frontend && npm run dev
   cd backend && npm run dev
   ```

## Docker Configuration

![Docker Build Process](docs/images/docker/build-process.png)
*Docker Multi-Stage Build Process*

### Backend Docker Configuration

```dockerfile
FROM node:18-alpine

# Add necessary build tools
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies
RUN npm ci --production

# Copy backend source
COPY backend/ ./backend/

WORKDIR /app/backend

# Set correct permissions
RUN chown -R node:node /app
USER node

# Environment configuration
ENV NODE_ENV=production \
    PORT=5000

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

EXPOSE 5000

CMD ["node", "src/index.js"]
```

### Frontend Docker Configuration

```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci
COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## AWS ECS Setup

![ECS Architecture](docs/images/aws/ecs-architecture.png)
*ECS Cluster Architecture*

### Create ECS Cluster

![ECS Cluster Creation](docs/images/aws/create-cluster.png)
*ECS Cluster Creation Steps*

1. Navigate to AWS ECS Console
2. Click "Create Cluster"
3. Configure:

   ```
   Cluster Name: ecommerce-cluster
   EC2 Linux + Networking
   Instance type: t2.micro (or as needed)
   Number of instances: 2
   VPC: Create new VPC
   Security Groups: Allow ports 80 and 5000
   ```

### Task Definition

The task definition includes both frontend and backend containers in a single task:

![Task Definition](docs/images/aws/task-definition.png)
*ECS Task Definition Configuration*

```json
{
    "family": "ecommerce-task-def",
    "containerDefinitions": [
        {
            "name": "frontend-container",
            "image": "<ECR_URI>/ecommerce-frontend:latest",
            "memory": 256,
            "cpu": 256,
            "portMappings": [
                {
                    "containerPort": 80,
                    "hostPort": 80
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/frontend",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "frontend"
                }
            }
        },
        {
            "name": "backend-container",
            "image": "<ECR_URI>/ecommerce-backend:latest",
            "memory": 512,
            "cpu": 256,
            "portMappings": [
                {
                    "containerPort": 5000,
                    "hostPort": 5000
                }
            ],
            "logConfiguration": {
                "logDriver": "awslogs",
                "options": {
                    "awslogs-group": "/ecs/backend",
                    "awslogs-region": "us-east-1",
                    "awslogs-stream-prefix": "backend"
                }
            },
            "environment": [
                {
                    "name": "NODE_ENV",
                    "value": "production"
                }
            ]
        }
    ],
    "requiresCompatibilities": ["EC2"],
    "networkMode": "bridge",
    "taskRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskRole",
    "executionRoleArn": "arn:aws:iam::<account-id>:role/ecsTaskExecutionRole"
}
```

### Create ECS Service

1. In ECS Cluster, select "Create Service"
2. Configure service:

   ```
   Launch type: EC2
   Task Definition: ecommerce-task-def
   Service name: ecommerce-service
   Number of tasks: 2
   ```

## GitHub Actions Workflow

![CI/CD Pipeline](docs/images/cicd/pipeline-overview.png)
*CI/CD Pipeline Overview*

The `.github/workflows/deploy.yml` workflow handles:

1. Testing
2. Building Docker images
3. Pushing to ECR
4. Deploying to ECS

### Environment Setup

```yaml
env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_FRONTEND: ecommerce-frontend
  ECR_REPOSITORY_BACKEND: ecommerce-backend
  ECS_CLUSTER: ecommerce-cluster
  ECS_SERVICE: ecommerce-service
  ECS_TASK_DEFINITION: ecommerce-task-def
```

### Build and Push Process

```yaml
- name: Build and push images
  env:
    ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
    IMAGE_TAG: ${{ github.sha }}
  run: |
    docker build -f docker/Dockerfile.frontend -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG .
    docker build -f docker/Dockerfile.backend -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG .
    docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
    docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG
```

## Security Implementation

![Security Architecture](docs/images/security/security-overview.png)
*Security Architecture Overview*

### IAM Roles and Permissions

![IAM Roles](docs/images/security/iam-roles.png)
*IAM Roles and Permissions Structure*

1. ECS Task Role (ecsTaskRole):
   - Permissions for task-level AWS API access
   - Used for application-specific AWS service access
   - Required policies:

     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "ecr:GetAuthorizationToken",
             "ecr:BatchCheckLayerAvailability",
             "ecr:GetDownloadUrlForLayer",
             "ecr:BatchGetImage"
           ],
           "Resource": "*"
         }
       ]
     }
     ```

2. ECS Task Execution Role (ecsTaskExecutionRole):
   - Permissions for ECS agent
   - ECR image pull
   - CloudWatch logs
   - Required policies:

     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "logs:CreateLogStream",
             "logs:PutLogEvents"
           ],
           "Resource": "*"
         }
       ]
     }
     ```

### Network Security

1. Security Groups:

   ```
   Inbound Rules:
   - Port 80 (Frontend container)
   - Port 5000 (Backend API)
   Outbound Rules:
   - All traffic
   ```

2. VPC Configuration:
   - Private subnets for ECS tasks
   - Public subnets for container instances

### Application Security

1. CORS Configuration:
   - Restricted to frontend domain
   - Proper HTTP methods allowed
   - Secure headers implemented

2. Environment Variables:
   - Sensitive data stored in AWS Secrets Manager
   - Environment-specific configurations

## Performance Optimization

![Performance Overview](docs/images/performance/optimization-overview.png)
*Performance Optimization Areas*

### Container Optimization

![Container Optimization](docs/images/performance/container-optimization.png)
*Container Resource Usage and Optimization*

1. Docker Image Size:
   - Multi-stage builds
   - Minimal base images
   - Layer optimization

2. Resource Allocation:
   - Proper CPU and memory limits
   - Container placement strategies

### Application Performance

1. Frontend Optimization:
   - Code splitting
   - Asset compression
   - Caching strategies

2. Backend Optimization:
   - Database indexing
   - Query optimization
   - Response caching

### Monitoring Performance

1. Key Metrics:
   - Container CPU/Memory usage
   - API response times
   - Error rates
   - Request throughput

2. Performance Alerts:
   - CPU utilization thresholds
   - Memory usage alerts
   - Response time degradation

## Monitoring and Observability

![Monitoring Dashboard](docs/images/monitoring/dashboard-overview.png)
*CloudWatch Monitoring Dashboard Overview*

### CloudWatch Integration

![CloudWatch Metrics](docs/images/monitoring/cloudwatch-metrics.png)
*CloudWatch Metrics and Alarms Configuration*

### Accessing Container Logs

#### Using AWS Management Console

1. Navigate to CloudWatch Logs:
   ![CloudWatch Navigation](docs/images/monitoring/cloudwatch-navigation.png)
   *Accessing CloudWatch in AWS Console*
   - Open AWS Management Console
   - Search for "CloudWatch"
   - Select "CloudWatch" from services

2. Access Log Groups:
   ![Log Groups](docs/images/monitoring/log-groups.png)
   *CloudWatch Log Groups View*
   - In the left navigation pane, click "Log groups"
   - Find `/ecs/frontend` or `/ecs/backend` log groups

3. View Container Logs:
   ![Log Streams](docs/images/monitoring/log-streams.png)
   *Container Log Streams*
   - Click on the respective log group
   - Select the latest log stream
   - View real-time logs with timestamp
   - Use filter patterns to search specific events:

     ```
     [timestamp, level="ERROR"]
     [timestamp, message="API request failed"]
     ```

4. Set Up Log Insights:
   ![Log Insights](docs/images/monitoring/log-insights.png)
   *CloudWatch Log Insights Query Interface*
   - Click "Insights" in CloudWatch
   - Select log groups to analyze
   - Use query examples:

     ```
     fields @timestamp, @message
     | filter @message like /ERROR/
     | sort @timestamp desc
     | limit 20
     ```

### Accessing Deployed Containers

#### Quick Access Guide

1. Get Container IP and Ports:
   ![Container Access](docs/images/deployment/container-access.png)
   *Container Access Information*
   ```bash
   # Get ECS instance public IP
   aws ecs list-container-instances --cluster ecommerce-cluster \
     --query 'containerInstanceArns[]' --output text | \
     xargs -I {} aws ecs describe-container-instances \
     --cluster ecommerce-cluster --container-instances {} \
     --query 'containerInstances[].ec2InstanceId' --output text | \
     xargs -I {} aws ec2 describe-instances --instance-ids {} \
     --query 'Reservations[].Instances[].PublicIpAddress' --output text
   ```

#### Frontend Container (Port 80)

1. Get Instance Public IP:
   ![ECS Instances](docs/images/aws/ecs-instances.png)
   *ECS Instance Details View*
   - Navigate to ECS Cluster
   - Click "ECS Instances"
   - Note the public IP address

2. Access Frontend Application:
   ![Frontend Access](docs/images/deployment/frontend-access.png)
   *Frontend Application Access*
   - Open browser and visit: `http://<PUBLIC_IP>:80`
   - Verify homepage loads
   - Test navigation and features
   - Check browser console for errors

3. Frontend Health Check:

   ```bash
   # Using curl
   curl http://<PUBLIC_IP>:80/health.txt
   ```

#### Backend Container (Port 5000)

1. Verify Backend API:
   ![Backend Health](docs/images/deployment/backend-health.png)
   *Backend Health Check Response*
   - Test health endpoint: `http://<PUBLIC_IP>:5000/api/health`

   ```bash
   # Using curl
   curl http://<PUBLIC_IP>:5000/api/health
   ```

2. Test API Endpoints:
   ![API Testing](docs/images/deployment/api-testing.png)
   *API Endpoint Testing Results*

   ```bash
   # Get products
   curl http://<PUBLIC_IP>:5000/api/products

   # Health check with headers
   curl -v http://<PUBLIC_IP>:5000/api/health
   ```

3. Monitor Backend Logs:
   ![Backend Logs](docs/images/monitoring/backend-logs.png)
   *Backend Application Logs*
   - Check CloudWatch logs for API requests
   - Verify correct status codes
   - Monitor response times

### Monitoring Deployed Containers

#### CloudWatch Logs Access

1. Using AWS Console:
   ![CloudWatch Console](docs/images/monitoring/cloudwatch-console.png)
   *CloudWatch Console Navigation*
   - Go to AWS Management Console
   - Navigate to CloudWatch service
   - Select "Log groups" from left sidebar
   - Choose `/ecs/frontend` or `/ecs/backend`

2. Using AWS CLI:
   ```bash
   # Get frontend logs
   aws logs get-log-events \
     --log-group-name /ecs/frontend \
     --log-stream-name $(aws logs describe-log-streams \
     --log-group-name /ecs/frontend \
     --order-by LastEventTime \
     --descending --limit 1 \
     --query 'logStreams[0].logStreamName' \
     --output text)

   # Get backend logs
   aws logs get-log-events \
     --log-group-name /ecs/backend \
     --log-stream-name $(aws logs describe-log-streams \
     --log-group-name /ecs/backend \
     --order-by LastEventTime \
     --descending --limit 1 \
     --query 'logStreams[0].logStreamName' \
     --output text)
   ```

3. Real-time Log Monitoring:
   ![Log Monitoring](docs/images/monitoring/log-monitoring.png)
   *Real-time Log Monitoring Dashboard*
   ```bash
   # Watch frontend logs in real-time
   aws logs tail /ecs/frontend --follow

   # Watch backend logs in real-time
   aws logs tail /ecs/backend --follow
   ```

### Container Health Verification

1. Container Status:
   ![Container Status](docs/images/deployment/container-status.png)
   *ECS Container Status Dashboard*
   - Both containers running
   - Health checks passing
   - No restart loops

2. Network Connectivity:
   ![Network Check](docs/images/deployment/network-check.png)
   *Network Connectivity Verification*
   - Ports accessible (80, 5000)
   - Security groups configured
   - Response times normal

3. Application Health:
   ![App Health](docs/images/deployment/app-health.png)
   *Application Health Metrics*
   - Frontend loads correctly
   - API endpoints responding
   - No console errors
   - Logs showing normal activity

### Alerting

1. CloudWatch Alarms:

   ```bash
   # Create CPU utilization alarm
   aws cloudwatch put-metric-alarm \
     --alarm-name high-cpu \
     --metric-name CPUUtilization \
     --namespace AWS/ECS \
     --statistic Average \
     --period 300 \
     --threshold 80 \
     --comparison-operator GreaterThanThreshold
   ```

2. Notification Setup:
   - SNS topics for alerts
   - Email notifications
   - Slack integration

## Troubleshooting Guide

![Troubleshooting Flow](docs/images/troubleshooting/debug-flow.png)
*Troubleshooting Decision Flow*

### Common Issues

![Common Issues](docs/images/troubleshooting/common-issues.png)
*Common Issues and Resolution Steps*

1. Container Startup Failures

   ```bash
   # Check container logs
   aws logs get-log-events \
     --log-group-name /ecs/backend \
     --log-stream-name <STREAM_NAME>
   
   # Check task status
   aws ecs describe-tasks \
     --cluster ecommerce-cluster \
     --tasks <TASK_ID>
   ```

2. Deployment Issues

   ```bash
   # Check service events
   aws ecs describe-services \
     --cluster ecommerce-cluster \
     --services ecommerce-service
   ```

3. Network Connectivity

   ```bash
   # Verify security group rules
   aws ec2 describe-security-groups \
     --group-ids <SECURITY_GROUP_ID>
   ```

### Debug Procedures

1. Container Health Checks:
   - Verify container health status
   - Check health check endpoints
   - Review health check logs

2. Resource Issues:
   - Monitor CPU/Memory usage
   - Check for resource constraints
   - Verify task definition limits

3. Deployment Rollbacks:

   ```bash
   # Roll back to previous task definition
   aws ecs update-service \
     --cluster ecommerce-cluster \
     --service ecommerce-service \
     --task-definition <PREVIOUS_TASK_DEF>
   ```

### Logging Best Practices

1. Log Levels:
   - ERROR: System errors
   - WARN: Warning conditions
   - INFO: General information
   - DEBUG: Detailed debugging

2. Log Format:

   ```json
   {
     "timestamp": "ISO8601",
     "level": "ERROR|WARN|INFO|DEBUG",
     "service": "frontend|backend",
     "message": "Log message",
     "metadata": {}
   }
   ```

3. Log Aggregation:
   - Centralized logging
   - Log correlation
   - Search and analysis

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
