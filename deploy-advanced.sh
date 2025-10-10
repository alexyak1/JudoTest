#!/bin/bash

# JudoTest Advanced Deployment Script
# This script provides comprehensive deployment with error handling, logging, and rollback capabilities

set -e  # Exit on any error

# Configuration
SERVER_IP="91.99.101.21"
SERVER_USER="root"
SERVER_PATH="/root/judoquiz/JudoTest"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
LOG_FILE="deployment.log"
BACKUP_DIR="/tmp/judo-backup-$(date +%Y%m%d-%H%M%S)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    local message="$1"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${BLUE}[$timestamp]${NC} $message" | tee -a "$LOG_FILE"
}

# Error handling function
handle_error() {
    local exit_code=$?
    log "${RED}❌ Deployment failed with exit code: $exit_code${NC}"
    log "${YELLOW}🔄 Attempting rollback...${NC}"
    rollback_deployment
    exit $exit_code
}

# Rollback function
rollback_deployment() {
    log "${YELLOW}🔄 Rolling back to previous version...${NC}"
    
    # Try to restore from backup if it exists
    if [ -d "$BACKUP_DIR" ]; then
        log "${YELLOW}📦 Restoring from backup...${NC}"
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && docker-compose down && docker-compose up -d" || true
    else
        log "${YELLOW}⚠️  No backup found, attempting to restart existing containers...${NC}"
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "cd $SERVER_PATH && docker-compose restart" || true
    fi
}

# Function to check if server is reachable
check_server_connection() {
    log "${YELLOW}🔍 Checking server connectivity...${NC}"
    
    if ! ping -c 1 "$SERVER_IP" > /dev/null 2>&1; then
        log "${RED}❌ Cannot reach server $SERVER_IP${NC}"
        exit 1
    fi
    
    # Check SSH key authentication first
    if [ -f "$SSH_KEY_PATH" ] && ssh -o BatchMode=yes -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'SSH key auth working'" > /dev/null 2>&1; then
        log "${GREEN}✅ SSH key authentication is working${NC}"
    elif ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "echo 'Connection successful'" > /dev/null 2>&1; then
        log "${YELLOW}⚠️  Using password authentication${NC}"
        log "${YELLOW}💡 Run './setup-ssh.sh' to set up passwordless authentication${NC}"
    else
        log "${RED}❌ Cannot SSH to server $SERVER_USER@$SERVER_IP${NC}"
        log "${YELLOW}💡 Make sure SSH key is set up or password authentication is enabled${NC}"
        exit 1
    fi
    
    log "${GREEN}✅ Server connection verified${NC}"
}

# Function to check Docker status
check_docker_status() {
    log "${YELLOW}🐳 Checking Docker status on server...${NC}"
    
    local docker_status=$(ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "systemctl is-active docker" 2>/dev/null || echo "inactive")
    
    if [ "$docker_status" != "active" ]; then
        log "${YELLOW}⚠️  Docker is not active, attempting to start...${NC}"
        ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "sudo systemctl start docker" || {
            log "${RED}❌ Failed to start Docker${NC}"
            exit 1
        }
    fi
    
    log "${GREEN}✅ Docker is running${NC}"
}

# Function to backup current deployment
backup_current_deployment() {
    log "${YELLOW}📦 Creating backup of current deployment...${NC}"
    
    ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "
        cd $SERVER_PATH
        if [ -f docker-compose.yml ]; then
            mkdir -p $BACKUP_DIR
            cp docker-compose.yml $BACKUP_DIR/
            cp Dockerfile $BACKUP_DIR/ 2>/dev/null || true
            echo 'Backup created at $BACKUP_DIR'
        else
            echo 'No existing deployment found to backup'
        fi
    " || log "${YELLOW}⚠️  Backup creation failed, continuing...${NC}"
}

# Function to execute commands on remote server with error handling
execute_remote_command() {
    local command="$1"
    local description="$2"
    
    log "${YELLOW}$description${NC}"
    log "${BLUE}Executing: $command${NC}"
    
    # Try with SSH key first, fallback to password if needed
    if [ -f "$SSH_KEY_PATH" ]; then
        if ssh -o StrictHostKeyChecking=no -i "$SSH_KEY_PATH" "$SERVER_USER@$SERVER_IP" "$command"; then
            log "${GREEN}✅ $description completed successfully${NC}"
            return 0
        else
            log "${RED}❌ $description failed${NC}"
            return 1
        fi
    else
        if ssh -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$command"; then
            log "${GREEN}✅ $description completed successfully${NC}"
            return 0
        else
            log "${RED}❌ $description failed${NC}"
            return 1
        fi
    fi
}

# Function to wait for service to be ready
wait_for_service() {
    local max_attempts=30
    local attempt=1
    
    log "${YELLOW}⏳ Waiting for service to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "http://$SERVER_IP" > /dev/null 2>&1; then
            log "${GREEN}✅ Service is ready and responding${NC}"
            return 0
        fi
        
        log "${YELLOW}Attempt $attempt/$max_attempts - Service not ready yet, waiting 10 seconds...${NC}"
        sleep 10
        ((attempt++))
    done
    
    log "${RED}❌ Service failed to become ready after $max_attempts attempts${NC}"
    return 1
}

# Main deployment process
main() {
    log "${GREEN}🚀 Starting JudoTest advanced deployment...${NC}"
    
    # Set up error handling
    trap handle_error ERR
    
    # Pre-deployment checks
    check_server_connection
    check_docker_status
    
    # Create backup
    backup_current_deployment
    
    # Navigate to project directory and verify it exists
    if ! execute_remote_command "cd $SERVER_PATH && pwd" "Verifying project directory"; then
        log "${RED}❌ Project directory $SERVER_PATH does not exist${NC}"
        exit 1
    fi
    
    # Pull latest code from git
    execute_remote_command "cd $SERVER_PATH && git pull" "Pulling latest code from git"
    
    # Stop existing containers
    execute_remote_command "cd $SERVER_PATH && docker-compose down" "Stopping existing containers"
    
    # Build new containers
    execute_remote_command "cd $SERVER_PATH && docker-compose build --no-cache" "Building new containers"
    
    # Start containers in detached mode
    execute_remote_command "cd $SERVER_PATH && docker-compose up -d" "Starting containers"
    
    # Wait for service to be ready
    wait_for_service
    
    # Final status check
    execute_remote_command "cd $SERVER_PATH && docker-compose ps" "Checking container status"
    
    # Health check
    execute_remote_command "cd $SERVER_PATH && docker-compose logs --tail=20" "Checking recent logs"
    
    log "${GREEN}🎉 Deployment completed successfully!${NC}"
    log "${GREEN}Your application is available at: http://$SERVER_IP${NC}"
    log "${GREEN}Deployment log saved to: $LOG_FILE${NC}"
}

# Show usage if help is requested
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "JudoTest Advanced Deployment Script"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --dry-run      Show what would be executed without actually running"
    echo ""
    echo "Configuration:"
    echo "  Server IP: $SERVER_IP"
    echo "  Server User: $SERVER_USER"
    echo "  Server Path: $SERVER_PATH"
    echo ""
    echo "Features:"
    echo "  - Automatic error handling and rollback"
    echo "  - Server connectivity checks"
    echo "  - Docker status verification"
    echo "  - Service health monitoring"
    echo "  - Comprehensive logging"
    echo "  - Backup creation before deployment"
    exit 0
fi

# Dry run mode
if [ "$1" = "--dry-run" ]; then
    log "${YELLOW}🔍 DRY RUN MODE - No actual changes will be made${NC}"
    log "${BLUE}Would execute the following commands:${NC}"
    log "${BLUE}1. ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && git pull'${NC}"
    log "${BLUE}2. ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose down'${NC}"
    log "${BLUE}3. ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose build --no-cache'${NC}"
    log "${BLUE}4. ssh $SERVER_USER@$SERVER_IP 'cd $SERVER_PATH && docker-compose up -d'${NC}"
    log "${BLUE}5. Wait for service to be ready at http://$SERVER_IP${NC}"
    exit 0
fi

# Run main deployment
main
