# Docker Guide - QR Code Generator

This guide provides instructions for building and running the QR Code Generator application using Docker.

## Quick Start

### Using Docker
```bash
# Build the image
docker build -t qr-code-generator .

# Run the container
docker run -d -p 8080:8080 --name qr-app qr-code-generator

# Access the application
open http://localhost:8080
```

### Using Docker Compose
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop and remove
docker-compose down
```

## Building the Image

### Basic Build
```bash
docker build -t qr-code-generator .
```

### Build with Version Tags
```bash
docker build -t qr-code-generator:1.0.0 -t qr-code-generator:latest .
```

### Build with Metadata
```bash
docker build \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VCS_REF=$(git rev-parse --short HEAD) \
  --build-arg VERSION=1.0.0 \
  -t qr-code-generator:1.0.0 \
  .
```

## Running the Container

### Basic Run
```bash
docker run -d -p 8080:8080 --name qr-app qr-code-generator
```

### Run with Custom Port
```bash
docker run -d -p 3000:8080 --name qr-app qr-code-generator
# Access at http://localhost:3000
```

### Run with Auto-Restart
```bash
docker run -d -p 8080:8080 --name qr-app --restart unless-stopped qr-code-generator
```

### Run with Resource Limits
```bash
docker run -d \
  -p 8080:8080 \
  --name qr-app \
  --memory="256m" \
  --cpus="0.5" \
  qr-code-generator
```

## Container Management

### View Running Containers
```bash
docker ps
```

### View Container Logs
```bash
# Follow logs
docker logs -f qr-app

# View last 100 lines
docker logs --tail 100 qr-app

# View logs with timestamps
docker logs -t qr-app
```

### Check Container Health
```bash
# Health status in ps output
docker ps

# Inspect health details
docker inspect --format='{{json .State.Health}}' qr-app | jq
```

### Stop and Remove Container
```bash
# Stop container
docker stop qr-app

# Remove container
docker rm qr-app

# Stop and remove in one command
docker rm -f qr-app
```

## Health Check

The container includes a built-in health check that runs every 30 seconds:

```bash
# Check health endpoint manually
curl http://localhost:8080/health

# Expected response
healthy
```

## Image Information

### View Image Details
```bash
# List images
docker images qr-code-generator

# Inspect image
docker inspect qr-code-generator

# View image layers
docker history qr-code-generator
```

### Image Specifications
- **Base Image**: nginx:alpine
- **Size**: ~15MB
- **Port**: 8080
- **User**: nginx (uid 1001)
- **Health Check**: Every 30s via `/health` endpoint

## Troubleshooting

### Container Won't Start
```bash
# Check logs for errors
docker logs qr-app

# Check container status
docker ps -a | grep qr-app

# Inspect container configuration
docker inspect qr-app
```

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Use a different port
docker run -d -p 9090:8080 --name qr-app qr-code-generator
```

### Health Check Failing
```bash
# Check if nginx is running
docker exec qr-app ps aux | grep nginx

# Test health endpoint
docker exec qr-app wget -qO- http://localhost:8080/health

# View nginx error logs
docker logs qr-app 2>&1 | grep error
```

### Cannot Access Application
```bash
# Verify container is running and healthy
docker ps

# Check port mappings
docker port qr-app

# Test from inside container
docker exec qr-app wget -qO- http://localhost:8080

# Check firewall settings
# Ensure port 8080 is not blocked by firewall
```

## Security

### Running with Enhanced Security
```bash
docker run -d \
  -p 8080:8080 \
  --name qr-app \
  --read-only \
  --cap-drop=ALL \
  --security-opt=no-new-privileges \
  qr-code-generator
```

### Security Features
- Non-root user (uid 1001)
- Minimal Alpine base image
- Security headers configured in Nginx
- No shell access in production
- dumb-init for proper signal handling

## Performance

### Caching Strategy
- **Versioned Assets** (JS, CSS): 1-year cache with `immutable` flag
- **HTML**: No cache (always fetch latest)
- **Gzip Compression**: Enabled for all text-based assets

### Nginx Optimization
- Worker processes: Auto-tuned to CPU count
- Gzip compression level: 6
- Keepalive timeout: 65 seconds
- Connection pooling: 1024 workers per process

## Production Deployment

### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: qr-code-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: qr-code-app
  template:
    metadata:
      labels:
        app: qr-code-app
    spec:
      containers:
      - name: qr-code-app
        image: qr-code-generator:latest
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: qr-code-app
spec:
  selector:
    app: qr-code-app
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

### Docker Swarm Deployment
```bash
# Initialize swarm (if not already done)
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml qr-stack

# View services
docker stack services qr-stack

# View logs
docker service logs qr-stack_qr-code-app

# Remove stack
docker stack rm qr-stack
```

## Development

### Building for Development
```bash
# Build without cache
docker build --no-cache -t qr-code-generator .

# Build with progress output
docker build --progress=plain -t qr-code-generator .
```

### Debugging
```bash
# Run interactive shell (requires changing USER directive)
docker run -it --entrypoint /bin/sh qr-code-generator

# Execute command in running container
docker exec -it qr-app /bin/sh

# Copy files from container
docker cp qr-app:/usr/share/nginx/html/index.html ./index.html
```

## Environment Variables

This application is a static site and does not require environment variables. All configuration is built into the image at build time.

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review container logs: `docker logs qr-app`
3. Verify health check: `curl http://localhost:8080/health`
