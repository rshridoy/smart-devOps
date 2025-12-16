# Azure Deployment Script for AI DevOps Monitor (PowerShell)
# This script automates the deployment to Azure VM

$ErrorActionPreference = "Stop"

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "AI DevOps Monitor - Azure Deployment" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$RESOURCE_GROUP = "ai-devops-rg"
$LOCATION = "eastus"
$VM_NAME = "ai-devops-vm"
$VM_SIZE = "Standard_D4s_v3"
$ADMIN_USERNAME = "azureuser"

# Functions
function Print-Success {
    param($message)
    Write-Host "✓ $message" -ForegroundColor Green
}

function Print-Error {
    param($message)
    Write-Host "✗ $message" -ForegroundColor Red
}

function Print-Info {
    param($message)
    Write-Host "→ $message" -ForegroundColor Yellow
}

# Step 1: Check Azure CLI
Print-Info "Checking Azure CLI installation..."
if (!(Get-Command az -ErrorAction SilentlyContinue)) {
    Print-Error "Azure CLI not found. Please install it first."
    Write-Host "Visit: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
}
Print-Success "Azure CLI found"

# Step 2: Login to Azure
Print-Info "Logging in to Azure..."
az login
Print-Success "Logged in to Azure"

# Step 3: Set subscription (optional)
Write-Host ""
$SUBSCRIPTION_ID = Read-Host "Enter your Azure Subscription ID (or press Enter to use default)"
if ($SUBSCRIPTION_ID) {
    az account set --subscription $SUBSCRIPTION_ID
    Print-Success "Subscription set"
}

# Step 4: Create Resource Group
Print-Info "Creating resource group: $RESOURCE_GROUP in $LOCATION..."
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
Print-Success "Resource group created"

# Step 5: Create Virtual Machine
Print-Info "Creating VM: $VM_NAME (this may take a few minutes)..."
$VM_OUTPUT = az vm create `
  --resource-group $RESOURCE_GROUP `
  --name $VM_NAME `
  --image Ubuntu2204 `
  --size $VM_SIZE `
  --admin-username $ADMIN_USERNAME `
  --generate-ssh-keys `
  --public-ip-sku Standard `
  --output json | ConvertFrom-Json

$VM_IP = $VM_OUTPUT.publicIpAddress
Print-Success "VM created with IP: $VM_IP"

# Step 6: Open ports
Print-Info "Opening required ports..."
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 8000 --priority 1000 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 5173 --priority 1001 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 9200 --priority 1002 --output none
az vm open-port --resource-group $RESOURCE_GROUP --name $VM_NAME --port 11434 --priority 1003 --output none
Print-Success "Ports opened"

# Step 7: Install Docker and dependencies on VM
Print-Info "Installing Docker and dependencies on VM..."
az vm run-command invoke `
  --resource-group $RESOURCE_GROUP `
  --name $VM_NAME `
  --command-id RunShellScript `
  --scripts `
    "sudo apt-get update" `
    "sudo apt-get install -y docker.io docker-compose git" `
    "sudo systemctl start docker" `
    "sudo systemctl enable docker" `
    "sudo usermod -aG docker $ADMIN_USERNAME" `
    "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -" `
    "sudo apt-get install -y nodejs" `
  --output none

Print-Success "Docker and dependencies installed"

# Step 8: Display next steps
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VM Details:"
Write-Host "  - IP Address: $VM_IP"
Write-Host "  - Username: $ADMIN_USERNAME"
Write-Host ""
Write-Host "Next Steps:"
Write-Host ""
Write-Host "1. SSH into the VM:" -ForegroundColor Yellow
Write-Host "   ssh $ADMIN_USERNAME@$VM_IP"
Write-Host ""
Write-Host "2. Clone your repository:" -ForegroundColor Yellow
Write-Host "   git clone https://github.com/yourusername/ai-devops-monitor.git"
Write-Host "   cd ai-devops-monitor"
Write-Host ""
Write-Host "3. Create .env file:" -ForegroundColor Yellow
Write-Host "   cp .env.example .env"
Write-Host "   nano .env  # Edit with your settings"
Write-Host ""
Write-Host "4. Start services:" -ForegroundColor Yellow
Write-Host "   docker-compose up -d"
Write-Host ""
Write-Host "5. Pull Mistral model:" -ForegroundColor Yellow
Write-Host "   docker exec ollama ollama pull mistral"
Write-Host ""
Write-Host "6. Setup frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend"
Write-Host "   npm install"
Write-Host "   npm run build"
Write-Host "   sudo npm install -g pm2"
Write-Host "   pm2 start npm --name frontend -- run dev"
Write-Host "   pm2 save"
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Green
Write-Host "  - API: http://$VM_IP:8000"
Write-Host "  - API Docs: http://$VM_IP:8000/docs"
Write-Host "  - Frontend: http://$VM_IP:5173"
Write-Host "  - OpenSearch: http://$VM_IP:9200"
Write-Host ""
Write-Host "To delete resources:" -ForegroundColor Red
Write-Host "  az group delete --name $RESOURCE_GROUP --yes --no-wait"
Write-Host ""
