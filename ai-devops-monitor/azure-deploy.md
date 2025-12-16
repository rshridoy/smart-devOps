# Azure Deployment Guide for AI DevOps Monitor

This guide provides step-by-step instructions to deploy the AI DevOps Monitor on Azure.

## Prerequisites

- Azure account with active subscription
- Azure CLI installed ([Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli))
- Docker installed locally
- Git installed

## Deployment Options

### Option 1: Azure Container Instances (Recommended for Quick Start)

**Pros:** Simple, fast deployment, no VM management
**Cons:** Less flexible, higher cost for long-running workloads

### Option 2: Azure Virtual Machine with Docker

**Pros:** Full control, cost-effective for 24/7 workloads
**Cons:** Requires VM management

### Option 3: Azure Kubernetes Service (AKS)

**Pros:** Scalable, production-grade, auto-healing
**Cons:** More complex, higher initial setup

---

## Option 1: Azure Container Instances (ACI) Deployment

### Step 1: Login to Azure

```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### Step 2: Create Resource Group

```bash
az group create --name ai-devops-rg --location eastus
```

### Step 3: Create Azure Container Registry (ACR)

```bash
az acr create --resource-group ai-devops-rg \
  --name aidevopsacr --sku Basic

# Enable admin access
az acr update -n aidevopsacr --admin-enabled true

# Get login credentials
az acr credential show --name aidevopsacr
```

### Step 4: Build and Push Docker Images

```bash
# Login to ACR
az acr login --name aidevopsacr

# Tag and push backend image
docker build -t aidevopsacr.azurecr.io/backend:latest .
docker push aidevopsacr.azurecr.io/backend:latest

# Build and push frontend (optional for static hosting)
cd frontend
docker build -t aidevopsacr.azurecr.io/frontend:latest .
docker push aidevopsacr.azurecr.io/frontend:latest
```

### Step 5: Deploy OpenSearch

```bash
az container create \
  --resource-group ai-devops-rg \
  --name opensearch \
  --image opensearchproject/opensearch:2.11.0 \
  --cpu 2 --memory 4 \
  --ports 9200 9600 \
  --environment-variables \
    'discovery.type'='single-node' \
    'OPENSEARCH_INITIAL_ADMIN_PASSWORD'='Admin@123' \
    'OPENSEARCH_JAVA_OPTS'='-Xms512m -Xmx512m' \
    'plugins.security.disabled'='true' \
  --ip-address Public \
  --dns-name-label ai-devops-opensearch
```

### Step 6: Deploy Ollama

```bash
az container create \
  --resource-group ai-devops-rg \
  --name ollama \
  --image ollama/ollama:latest \
  --cpu 2 --memory 4 \
  --ports 11434 \
  --ip-address Public \
  --dns-name-label ai-devops-ollama

# Pull Mistral model after container starts
az container exec --resource-group ai-devops-rg \
  --name ollama --exec-command "ollama pull mistral"
```

### Step 7: Deploy Backend

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name aidevopsacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name aidevopsacr --query passwords[0].value -o tsv)

az container create \
  --resource-group ai-devops-rg \
  --name backend \
  --image aidevopsacr.azurecr.io/backend:latest \
  --cpu 2 --memory 4 \
  --ports 8000 \
  --registry-login-server aidevopsacr.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --environment-variables \
    OPENSEARCH_HOST=ai-devops-opensearch.eastus.azurecontainer.io \
    OPENSEARCH_PORT=9200 \
    OPENSEARCH_USE_SSL=false \
    OLLAMA_BASE_URL=http://ai-devops-ollama.eastus.azurecontainer.io:11434 \
    OLLAMA_MODEL=mistral \
  --ip-address Public \
  --dns-name-label ai-devops-backend
```

### Step 8: Deploy Frontend to Azure Static Web Apps

```bash
# Install Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli

# Deploy frontend
cd frontend
npm install
npm run build

# Create Static Web App
az staticwebapp create \
  --name ai-devops-frontend \
  --resource-group ai-devops-rg \
  --location eastus2

# Deploy using GitHub Actions or manual upload
# Follow the deployment steps shown after creation
```

---

## Option 2: Azure Virtual Machine Deployment

### Step 1: Create VM

```bash
az vm create \
  --resource-group ai-devops-rg \
  --name ai-devops-vm \
  --image Ubuntu2204 \
  --size Standard_D4s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open ports
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 8000
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 5173
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 9200
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 11434
```

### Step 2: SSH into VM and Install Docker

```bash
# Get VM IP
VM_IP=$(az vm show --resource-group ai-devops-rg --name ai-devops-vm --show-details --query publicIps -o tsv)

# SSH into VM
ssh azureuser@$VM_IP

# Install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Logout and login again for docker group to take effect
exit
ssh azureuser@$VM_IP
```

### Step 3: Clone and Deploy

```bash
# Clone repository
git clone https://github.com/yourusername/ai-devops-monitor.git
cd ai-devops-monitor

# Create .env file
cp .env.example .env
nano .env  # Edit with your settings

# Start services
docker-compose up -d

# Pull Mistral model
docker exec ollama ollama pull mistral

# Setup frontend
cd frontend
npm install
npm run build

# Install PM2 for frontend process management
sudo npm install -g pm2
pm2 start npm --name "frontend" -- run dev
pm2 save
pm2 startup
```

---

## Option 3: Azure Kubernetes Service (AKS)

### Step 1: Create AKS Cluster

```bash
az aks create \
  --resource-group ai-devops-rg \
  --name ai-devops-aks \
  --node-count 3 \
  --node-vm-size Standard_D4s_v3 \
  --enable-managed-identity \
  --generate-ssh-keys

# Get credentials
az aks get-credentials --resource-group ai-devops-rg --name ai-devops-aks
```

### Step 2: Create Kubernetes Manifests

See `kubernetes/` directory for deployment files.

```bash
# Apply configurations
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/opensearch.yaml
kubectl apply -f kubernetes/ollama.yaml
kubectl apply -f kubernetes/backend.yaml
kubectl apply -f kubernetes/frontend.yaml
kubectl apply -f kubernetes/ingress.yaml
```

---

## Post-Deployment Configuration

### 1. Configure Environment Variables

Create `.env` file with Azure-specific settings:

```env
# OpenSearch
OPENSEARCH_HOST=<opensearch-dns-or-ip>
OPENSEARCH_PORT=9200
OPENSEARCH_USE_SSL=false

# Ollama
OLLAMA_BASE_URL=http://<ollama-dns-or-ip>:11434
OLLAMA_MODEL=mistral

# Alerts (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### 2. Setup Domain (Optional)

```bash
# Create DNS zone
az network dns zone create \
  --resource-group ai-devops-rg \
  --name yourdomain.com

# Create A record pointing to your public IP
az network dns record-set a add-record \
  --resource-group ai-devops-rg \
  --zone-name yourdomain.com \
  --record-set-name api \
  --ipv4-address <backend-ip>
```

### 3. Enable HTTPS with SSL Certificate

For Azure VM:

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

For AKS:

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Configure Let's Encrypt issuer
kubectl apply -f kubernetes/cert-issuer.yaml
```

### 4. Setup Monitoring

```bash
# Install Azure Monitor agent
az vm extension set \
  --resource-group ai-devops-rg \
  --vm-name ai-devops-vm \
  --name AzureMonitorLinuxAgent \
  --publisher Microsoft.Azure.Monitor
```

---

## Cost Optimization

### 1. Use Azure Reserved Instances
- Save up to 72% with 1 or 3-year reservations

### 2. Auto-scaling
```bash
# For AKS
kubectl autoscale deployment backend --cpu-percent=70 --min=2 --max=10
```

### 3. Use Azure Spot VMs
```bash
az vm create \
  --resource-group ai-devops-rg \
  --name ai-devops-vm \
  --priority Spot \
  --max-price -1
```

---

## Troubleshooting

### Check Container Logs (ACI)
```bash
az container logs --resource-group ai-devops-rg --name backend
```

### Check VM Logs
```bash
ssh azureuser@$VM_IP
docker-compose logs -f backend
```

### Check AKS Pods
```bash
kubectl get pods -n ai-devops
kubectl logs <pod-name> -n ai-devops
```

---

## Security Best Practices

1. **Use Azure Key Vault** for secrets
2. **Enable Azure Security Center**
3. **Configure Network Security Groups (NSG)**
4. **Enable Azure DDoS Protection**
5. **Use Managed Identities** instead of passwords
6. **Enable Azure AD authentication**

---

## Estimated Monthly Costs

### Option 1: ACI
- Backend: ~$30-50/month
- OpenSearch: ~$60-80/month
- Ollama: ~$60-80/month
- **Total: ~$150-210/month**

### Option 2: VM (D4s_v3)
- VM: ~$140/month
- Storage: ~$10/month
- **Total: ~$150/month**

### Option 3: AKS
- Cluster: ~$70/month
- 3 x D4s_v3 nodes: ~$420/month
- **Total: ~$490/month**

---

## Support

For issues, see:
- [Azure Documentation](https://docs.microsoft.com/azure)
- [Project Issues](https://github.com/yourusername/ai-devops-monitor/issues)
