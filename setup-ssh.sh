#!/bin/bash

# SSH Key Setup Script for JudoTest Deployment
# This script helps you set up passwordless SSH authentication

# Configuration
SERVER_IP="91.99.101.21"
SERVER_USER="root"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔑 Setting up SSH key authentication for JudoTest deployment${NC}"
echo ""

# Function to check if SSH key exists
check_ssh_key() {
    if [ -f "$SSH_KEY_PATH" ]; then
        echo -e "${GREEN}✅ SSH key found at: $SSH_KEY_PATH${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  No SSH key found at: $SSH_KEY_PATH${NC}"
        return 1
    fi
}

# Function to generate SSH key
generate_ssh_key() {
    echo -e "${YELLOW}🔨 Generating new SSH key...${NC}"
    echo -e "${BLUE}You can press Enter to use default values for the prompts below${NC}"
    
    ssh-keygen -t rsa -b 4096 -C "judo-deployment-$(date +%Y%m%d)" -f "$SSH_KEY_PATH"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSH key generated successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to generate SSH key${NC}"
        return 1
    fi
}

# Function to copy SSH key to server
copy_ssh_key() {
    echo -e "${YELLOW}📤 Copying SSH key to server...${NC}"
    echo -e "${BLUE}You will need to enter the server password one last time${NC}"
    
    # Try ssh-copy-id first (most common method)
    if command -v ssh-copy-id >/dev/null 2>&1; then
        ssh-copy-id "$SERVER_USER@$SERVER_IP"
    else
        # Fallback method if ssh-copy-id is not available
        echo -e "${YELLOW}ssh-copy-id not found, using manual method...${NC}"
        
        # Create .ssh directory if it doesn't exist
        ssh "$SERVER_USER@$SERVER_IP" "mkdir -p ~/.ssh && chmod 700 ~/.ssh"
        
        # Copy the public key
        cat "$SSH_KEY_PATH.pub" | ssh "$SERVER_USER@$SERVER_IP" "cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ SSH key copied to server successfully${NC}"
        return 0
    else
        echo -e "${RED}❌ Failed to copy SSH key to server${NC}"
        return 1
    fi
}

# Function to test SSH connection
test_ssh_connection() {
    echo -e "${YELLOW}🔍 Testing SSH connection...${NC}"
    
    if ssh -o BatchMode=yes -o ConnectTimeout=10 "$SERVER_USER@$SERVER_IP" "echo 'SSH connection successful'" 2>/dev/null; then
        echo -e "${GREEN}✅ SSH key authentication working! No password required.${NC}"
        return 0
    else
        echo -e "${RED}❌ SSH key authentication failed${NC}"
        return 1
    fi
}

# Function to show manual setup instructions
show_manual_instructions() {
    echo -e "${YELLOW}📋 Manual Setup Instructions:${NC}"
    echo ""
    echo -e "${BLUE}If the automatic setup failed, you can set this up manually:${NC}"
    echo ""
    echo -e "${BLUE}1. Generate SSH key (if not already done):${NC}"
    echo -e "   ${YELLOW}ssh-keygen -t rsa -b 4096${NC}"
    echo ""
    echo -e "${BLUE}2. Copy your public key to the server:${NC}"
    echo -e "   ${YELLOW}ssh-copy-id $SERVER_USER@$SERVER_IP${NC}"
    echo ""
    echo -e "${BLUE}3. Or manually copy the key:${NC}"
    echo -e "   ${YELLOW}cat ~/.ssh/id_rsa.pub | ssh $SERVER_USER@$SERVER_IP 'cat >> ~/.ssh/authorized_keys'${NC}"
    echo ""
    echo -e "${BLUE}4. Test the connection:${NC}"
    echo -e "   ${YELLOW}ssh $SERVER_USER@$SERVER_IP 'echo \"Connection successful\"'${NC}"
    echo ""
}

# Main setup process
main() {
    echo -e "${BLUE}Server: $SERVER_USER@$SERVER_IP${NC}"
    echo -e "${BLUE}SSH Key: $SSH_KEY_PATH${NC}"
    echo ""
    
    # Check if SSH key exists
    if ! check_ssh_key; then
        echo -e "${YELLOW}Would you like to generate a new SSH key? (y/n)${NC}"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            if ! generate_ssh_key; then
                echo -e "${RED}❌ Setup failed${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}Please generate an SSH key manually and run this script again${NC}"
            show_manual_instructions
            exit 1
        fi
    fi
    
    # Copy SSH key to server
    if ! copy_ssh_key; then
        echo -e "${RED}❌ Failed to copy SSH key${NC}"
        show_manual_instructions
        exit 1
    fi
    
    # Test the connection
    if test_ssh_connection; then
        echo ""
        echo -e "${GREEN}🎉 SSH key authentication setup complete!${NC}"
        echo -e "${GREEN}You can now run your deployment scripts without entering a password.${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo -e "${YELLOW}1. Run: ./deploy.sh${NC}"
        echo -e "${YELLOW}2. Or run: ./deploy-advanced.sh${NC}"
    else
        echo -e "${RED}❌ SSH key authentication test failed${NC}"
        show_manual_instructions
        exit 1
    fi
}

# Show help
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "SSH Key Setup Script for JudoTest Deployment"
    echo ""
    echo "This script helps you set up passwordless SSH authentication"
    echo "so you don't need to enter your password every time you deploy."
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --test-only    Only test existing SSH key (don't set up new one)"
    echo ""
    echo "What this script does:"
    echo "  1. Checks if you have an SSH key"
    echo "  2. Generates one if needed"
    echo "  3. Copies your public key to the server"
    echo "  4. Tests the passwordless connection"
    echo ""
    exit 0
fi

# Test-only mode
if [ "$1" = "--test-only" ]; then
    echo -e "${YELLOW}🔍 Testing existing SSH key authentication...${NC}"
    if test_ssh_connection; then
        echo -e "${GREEN}✅ SSH key authentication is working!${NC}"
        exit 0
    else
        echo -e "${RED}❌ SSH key authentication is not working${NC}"
        echo -e "${YELLOW}Run this script without --test-only to set it up${NC}"
        exit 1
    fi
fi

# Run main setup
main
