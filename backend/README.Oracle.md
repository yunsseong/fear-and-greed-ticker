# Oracle Cloud Deployment Guide

## Prerequisites

### 1. Oracle Cloud Free Tier Instance
- **Shape**: VM.Standard.E2.1.Micro (Always Free)
- **OS**: Ubuntu 22.04 LTS
- **Memory**: 1GB RAM
- **Storage**: 50GB Boot Volume

### 2. Required Software on Instance
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose -y

# Install Git
sudo apt install git -y

# Install curl (for health checks)
sudo apt install curl -y
```

### 3. GitHub Secrets Configuration

Add these secrets to your GitHub repository:
- `ORACLE_HOST`: Your Oracle instance public IP
- `ORACLE_USERNAME`: SSH username (usually `ubuntu`)
- `ORACLE_SSH_KEY`: Private SSH key for authentication
- `ORACLE_PORT`: SSH port (default: 22)

## Initial Setup on Oracle Cloud

### 1. SSH into your Oracle instance
```bash
ssh ubuntu@<your-oracle-ip>
```

### 2. Create deployment directory
```bash
sudo mkdir -p /opt/fear-greed-backend
sudo chown -R $USER:$USER /opt/fear-greed-backend
cd /opt/fear-greed-backend
```

### 3. Clone repository
```bash
git clone https://github.com/yunsseong/fear-and-greed-ticker.git .
cd backend
```

### 4. Create logs directory
```bash
mkdir -p logs
```

### 5. Configure firewall (Oracle Cloud)

**Security List Rules (Ingress):**
```
Source: 0.0.0.0/0
Protocol: TCP
Port: 8000
Description: Fear & Greed API
```

**iptables (on instance):**
```bash
sudo iptables -I INPUT 1 -p tcp --dport 8000 -j ACCEPT
sudo netfilter-persistent save
```

### 6. Initial deployment
```bash
# Pull initial image
docker pull ghcr.io/yunsseong/fear-greed-backend:latest

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check health
curl http://localhost:8000/health
```

## CI/CD Workflow

### Automatic Deployment Process

1. **Push to main branch** with backend changes
2. **GitHub Actions triggers:**
   - Runs tests
   - Builds Docker image
   - Pushes to GitHub Container Registry
   - SSH into Oracle instance
   - Pulls latest image
   - Restarts containers

### Manual Deployment

If you need to deploy manually:

```bash
# SSH into Oracle instance
ssh ubuntu@<your-oracle-ip>

# Run deployment script
cd /opt/fear-greed-backend/backend
sudo bash deploy.sh
```

## Monitoring

### Check service status
```bash
docker ps
docker-compose -f docker-compose.prod.yml ps
```

### View logs
```bash
# Real-time logs
docker-compose -f docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail=100

# Specific service logs
docker logs fear-greed-backend
```

### Health check
```bash
curl http://localhost:8000/health
```

### API test
```bash
# Stock index
curl http://localhost:8000/api/v1/fear-greed/stock

# Crypto index
curl http://localhost:8000/api/v1/fear-greed/crypto
```

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check container status
docker ps -a

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

### Port already in use
```bash
# Find process using port 8000
sudo lsof -i :8000

# Kill process
sudo kill -9 <PID>
```

### Image pull fails
```bash
# Check GitHub token
echo $GITHUB_TOKEN

# Login manually
echo $GITHUB_TOKEN | docker login ghcr.io -u yunsseong --password-stdin

# Pull image
docker pull ghcr.io/yunsseong/fear-greed-backend:latest
```

### Out of disk space
```bash
# Clean up Docker resources
docker system prune -a -f

# Check disk usage
df -h
```

## Updating the Application

### Via CI/CD (Automatic)
1. Push changes to main branch
2. GitHub Actions will automatically deploy

### Manual Update
```bash
cd /opt/fear-greed-backend/backend
sudo bash deploy.sh
```

## Rollback

If deployment fails:

```bash
# List available images
docker images | grep fear-greed-backend

# Use specific version
docker-compose -f docker-compose.prod.yml down
docker tag ghcr.io/yunsseong/fear-greed-backend:<old-sha> ghcr.io/yunsseong/fear-greed-backend:latest
docker-compose -f docker-compose.prod.yml up -d
```

## Performance Optimization

### Resource Limits
Configured in `docker-compose.prod.yml`:
- CPU: 0.5-1.0 cores
- Memory: 256MB-512MB

### Monitoring Resource Usage
```bash
# Real-time stats
docker stats fear-greed-backend

# Memory usage
docker inspect fear-greed-backend --format='{{.HostConfig.Memory}}'
```

## Security Best Practices

1. **Firewall**: Only allow necessary ports (22, 8000)
2. **SSH**: Use key-based authentication, disable password auth
3. **Updates**: Keep system and Docker updated
4. **Secrets**: Never commit .env files
5. **CORS**: Update CORS_ORIGINS in production to specific domains

## Maintenance

### Weekly
- Check logs for errors
- Monitor resource usage
- Verify health endpoint

### Monthly
- Update system packages
- Review and clean Docker images
- Check disk usage

### As Needed
- Scale resources if needed
- Update application via CI/CD
- Review and rotate secrets

## Support

For issues:
- Check logs: `docker-compose -f docker-compose.prod.yml logs`
- GitHub Issues: https://github.com/yunsseong/fear-and-greed-ticker/issues
- Health endpoint: http://localhost:8000/health
