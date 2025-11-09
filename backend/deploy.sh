#!/bin/bash

# Backend Deployment Script for Oracle Cloud
# This script should be run on the Oracle Cloud instance

set -e

echo "========================================="
echo "Fear & Greed Backend Deployment"
echo "========================================="

# Configuration
DEPLOY_DIR="/opt/fear-greed-backend"
REPO_URL="https://github.com/yunsseong/fear-and-greed-ticker.git"
BRANCH="main"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    print_error "Please run with sudo"
    exit 1
fi

# Create deployment directory if it doesn't exist
if [ ! -d "$DEPLOY_DIR" ]; then
    print_info "Creating deployment directory: $DEPLOY_DIR"
    mkdir -p $DEPLOY_DIR
    cd $DEPLOY_DIR

    print_info "Cloning repository..."
    git clone $REPO_URL .
else
    print_info "Updating existing repository..."
    cd $DEPLOY_DIR
    git fetch origin
    git reset --hard origin/$BRANCH
fi

# Navigate to backend directory
cd backend

# Create logs directory
print_info "Creating logs directory..."
mkdir -p logs

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Pull latest Docker image
print_info "Pulling latest Docker image..."
docker pull ghcr.io/yunsseong/fear-greed-backend:latest

# Stop existing containers
print_info "Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down || true

# Start new containers
print_info "Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for health check
print_info "Waiting for service to be healthy..."
sleep 10

# Health check
print_info "Performing health check..."
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    print_info "✓ Health check passed"
else
    print_error "✗ Health check failed"
    print_info "Checking logs..."
    docker-compose -f docker-compose.prod.yml logs --tail=50
    exit 1
fi

# Clean up old images
print_info "Cleaning up old Docker images..."
docker image prune -f

# Show running containers
print_info "Running containers:"
docker ps --filter "name=fear-greed-backend"

# Show logs
print_info "Recent logs:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "========================================="
print_info "Deployment completed successfully!"
echo "========================================="
print_info "API URL: http://localhost:8000"
print_info "Health: http://localhost:8000/health"
print_info "Logs: docker-compose -f docker-compose.prod.yml logs -f"
