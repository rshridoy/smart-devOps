# Quick Azure Deployment Guide

## 🚀 Quick Start (Recommended)

### Option 1: Automated Script Deployment

**Windows:**
```powershell
.\deploy-azure.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-azure.sh
./deploy-azure.sh
```

### Option 2: Manual Azure VM Setup

```bash
# 1. Login
az login

# 2. Create resources
az group create --name ai-devops-rg --location eastus

# 3. Create VM
az vm create \
  --resource-group ai-devops-rg \
  --name ai-devops-vm \
  --image Ubuntu2204 \
  --size Standard_D4s_v3 \
  --admin-username azureuser \
  --generate-ssh-keys

# 4. Open ports
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 8000
az vm open-port --resource-group ai-devops-rg --name ai-devops-vm --port 5173

# 5. SSH and setup
ssh azureuser@<VM_IP>
git clone <your-repo>
cd ai-devops-monitor
docker-compose up -d
```

---

## 📋 Essential Commands

### VM Management
```bash
# Start VM
az vm start --resource-group ai-devops-rg --name ai-devops-vm

# Stop VM (saves costs)
az vm deallocate --resource-group ai-devops-rg --name ai-devops-vm

# Restart VM
az vm restart --resource-group ai-devops-rg --name ai-devops-vm

# Get VM IP
az vm show --resource-group ai-devops-rg --name ai-devops-vm \
  --show-details --query publicIps -o tsv

# Delete VM only (keep other resources)
az vm delete --resource-group ai-devops-rg --name ai-devops-vm --yes

# Delete everything
az group delete --name ai-devops-rg --yes --no-wait
```

### Container Management (on VM)
```bash
# SSH into VM
ssh azureuser@<VM_IP>

# Check containers
docker ps

# View logs
docker-compose logs -f backend

# Restart services
docker-compose restart

# Stop all
docker-compose down

# Start all
docker-compose up -d
```

### Frontend Management
```bash
# Start frontend
cd frontend
pm2 start npm --name frontend -- run dev

# Stop frontend
pm2 stop frontend

# View logs
pm2 logs frontend

# Restart
pm2 restart frontend
```

---

## 💰 Cost Management

### Stop VM When Not in Use
```bash
# Stop VM (saves ~70% of compute costs)
az vm deallocate --resource-group ai-devops-rg --name ai-devops-vm

# Start when needed
az vm start --resource-group ai-devops-rg --name ai-devops-vm
```

### Estimated Costs (per month)
- **D4s_v3 VM:** ~$140/month (running 24/7)
- **Storage:** ~$10/month
- **Network:** ~$5/month
- **Total:** ~$155/month

**Cost Saving Tips:**
- Use B-series VMs for development (~$60/month)
- Stop VM when not in use
- Use Azure Reserved Instances (save up to 72%)
- Use Spot VMs for non-critical workloads

---

## 🔒 Security Setup

### Configure Firewall
```bash
# Allow only your IP
MY_IP=$(curl -s ifconfig.me)
az vm open-port --resource-group ai-devops-rg \
  --name ai-devops-vm --port 8000 \
  --priority 1000 \
  --source-address-prefixes $MY_IP/32
```

### Enable HTTPS
```bash
# SSH into VM
ssh azureuser@<VM_IP>

# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Get certificate (requires domain)
sudo certbot --nginx -d api.yourdomain.com
```

### Backup
```bash
# Create VM snapshot
az snapshot create \
  --resource-group ai-devops-rg \
  --name ai-devops-snapshot \
  --source ai-devops-vm
```

---

## 📊 Monitoring

### View Metrics
```bash
# CPU usage
az vm show --resource-group ai-devops-rg \
  --name ai-devops-vm --show-details

# Enable Azure Monitor
az vm extension set \
  --resource-group ai-devops-rg \
  --vm-name ai-devops-vm \
  --name AzureMonitorLinuxAgent \
  --publisher Microsoft.Azure.Monitor
```

### Application Logs
```bash
# SSH into VM
ssh azureuser@<VM_IP>

# Backend logs
docker logs -f backend

# OpenSearch logs
docker logs -f opensearch

# System logs
sudo journalctl -f
```

---

## 🔧 Troubleshooting

### Can't Connect to VM?
```bash
# Check VM status
az vm get-instance-view --resource-group ai-devops-rg --name ai-devops-vm

# Check NSG rules
az network nsg list --resource-group ai-devops-rg

# Restart VM
az vm restart --resource-group ai-devops-rg --name ai-devops-vm
```

### Containers Not Starting?
```bash
ssh azureuser@<VM_IP>

# Check Docker status
sudo systemctl status docker

# Check logs
docker-compose logs

# Restart Docker
sudo systemctl restart docker
docker-compose up -d
```

### Out of Memory?
```bash
# Check memory
free -h

# Resize VM to larger size
az vm deallocate --resource-group ai-devops-rg --name ai-devops-vm
az vm resize --resource-group ai-devops-rg --name ai-devops-vm \
  --size Standard_D8s_v3
az vm start --resource-group ai-devops-rg --name ai-devops-vm
```

---

## 🌐 Custom Domain Setup

### 1. Get VM IP
```bash
VM_IP=$(az vm show --resource-group ai-devops-rg --name ai-devops-vm \
  --show-details --query publicIps -o tsv)
echo $VM_IP
```

### 2. Configure DNS
Go to your domain provider and add:
- **A Record:** `api` → `<VM_IP>`
- **A Record:** `app` → `<VM_IP>`

### 3. Install SSL
```bash
ssh azureuser@<VM_IP>
sudo certbot --nginx -d api.yourdomain.com -d app.yourdomain.com
```

---

## 📚 Useful Links

- **Azure Portal:** https://portal.azure.com
- **Azure CLI Docs:** https://docs.microsoft.com/cli/azure
- **VM Pricing:** https://azure.microsoft.com/pricing/calculator
- **Azure Monitor:** https://portal.azure.com/#blade/Microsoft_Azure_Monitoring/AzureMonitoringBrowseBlade

---

## 🆘 Quick Help

### Access URLs
- **API:** `http://<VM_IP>:8000`
- **API Docs:** `http://<VM_IP>:8000/docs`
- **Frontend:** `http://<VM_IP>:5173`
- **OpenSearch:** `http://<VM_IP>:9200`

### SSH Connection
```bash
ssh azureuser@<VM_IP>
```

### Emergency Stop (Save Costs)
```bash
az vm deallocate --resource-group ai-devops-rg --name ai-devops-vm
```

### Complete Cleanup
```bash
az group delete --name ai-devops-rg --yes --no-wait
```
