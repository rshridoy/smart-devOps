#!/bin/bash

# Azure Deployment Script for AI DevOps Monitor
# This script automates the deployment to Azure VM

set -e

echo "=================================="
echo "AI DevOps Monitor - Azure Deployment"
echo "=================================="
echo ""

# Configuration
RESOURCE_GROUP="ai-devops-rg"
LOCATION="eastus"
VM_NAME="ai-devops-vm"
VM_SIZE="Standard_D4s_v3"
ADMIN_USERNAME="azureuser"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Step 1: Check Azure CLI
print_info "Checking Azure CLI installation..."
if ! command -v az &> /dev/null; then
    print_error "Azure CLI not found. Please install it first."
    echo "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi
print_success "Azure CLI found"

# Step 2: Login to Azure
print_info "Logging in to Azure..."
az login
print_success "Logged in to Azure"

# Step 3: Set subscription (optional)
echo ""
read -p "Enter your Azure Subscription ID (or press Enter to use default): " SUBSCRIPTION_ID
if [ ! -z "$SUBSCRIPTION_ID" ]; then
    az account set --subscription "$SUBSCRIPTION_ID"
    print_success "Subscription set"
fi

# Step 4: Create Resource Group
print_info "Creating resource group: $RESOURCE_GROUP in $LOCATION..."
az group create --name "$RESOURCE_GROUP" --location "$LOCATION" --output none
print_success "Resource group created"

# Step 5: Create Virtual Machine
print_info "Creating VM: $VM_NAME (this may take a few minutes)..."
VM_OUTPUT=$(az vm create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --image Ubuntu2204 \
  --size "$VM_SIZE" \
  --admin-username "$ADMIN_USERNAME" \
  --generate-ssh-keys \
  --public-ip-sku Standard \
  --output json)

VM_IP=$(echo $VM_OUTPUT | jq -r '.publicIpAddress')
print_success "VM created with IP: $VM_IP"

# Step 6: Open ports
print_info "Opening required ports..."
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 8000 --priority 1000 --output none
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 5173 --priority 1001 --output none
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 9200 --priority 1002 --output none
az vm open-port --resource-group "$RESOURCE_GROUP" --name "$VM_NAME" --port 11434 --priority 1003 --output none
print_success "Ports opened"

# Step 7: Install Docker and dependencies on VM
print_info "Installing Docker and dependencies on VM..."
az vm run-command invoke \
  --resource-group "$RESOURCE_GROUP" \
  --name "$VM_NAME" \
  --command-id RunShellScript \
  --scripts \
    "sudo apt-get update" \
    "sudo apt-get install -y docker.io docker-compose git" \
    "sudo systemctl start docker" \
    "sudo systemctl enable docker" \
    "sudo usermod -aG docker $ADMIN_USERNAME" \
    "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" \
    "sudo apt-get install -y nodejs" \
  --output none

print_success "Docker and dependencies installed"

# Step 8: Get deployment instructions
echo ""
echo "=================================="
echo "Deployment Complete!"
echo "=================================="
echo ""
echo "VM Details:"
echo "  - IP Address: $VM_IP"
echo "  - Username: $ADMIN_USERNAME"
echo ""
echo "Next Steps:"
echo ""
echo "1. SSH into the VM:"
echo "   ssh $ADMIN_USERNAME@$VM_IP"
echo ""
echo "2. Clone your repository:"
echo "   git clone https://github.com/yourusername/ai-devops-monitor.git"
echo "   cd ai-devops-monitor"
echo ""
echo "3. Create .env file:"
echo "   cp .env.example .env"
echo "   nano .env  # Edit with your settings"
echo ""
echo "4. Start services:"
echo "   docker-compose up -d"
echo ""
echo "5. Pull Mistral model:"
echo "   docker exec ollama ollama pull mistral"
echo ""
echo "6. Setup frontend:"
echo "   cd frontend"
echo "   npm install"
echo "   npm run build"
echo "   sudo npm install -g pm2"
echo "   pm2 start npm --name frontend -- run dev"
echo "   pm2 save"
echo ""
echo "Access URLs:"
echo "  - API: http://$VM_IP:8000"
echo "  - API Docs: http://$VM_IP:8000/docs"
echo "  - Frontend: http://$VM_IP:5173"
echo "  - OpenSearch: http://$VM_IP:9200"
echo ""
echo "To delete resources:"
echo "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
echo ""
