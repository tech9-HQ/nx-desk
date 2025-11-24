# **NX-Desk**

NX-Desk is a modern, containerized React + Vite frontend application designed for enterprise-grade deployment. It supports scalable architecture, cloud-native deployment, AI-powered proposal generation workflows, and seamless integration with Azure Container Apps.

This documentation covers architecture, local development, Dockerization, CI/CD, custom domain setup, HTTPS, environment management, and operational best practices.

---

## **📌 Overview**

NX-Desk is built for:

* Sales and Proposal teams
* Automated proposal generation (AI-assisted)
* Modular multi-agent architecture
* Deployment to Azure using **Docker + Azure Container Apps + ACR**
* Custom domain mapping and **Managed HTTPS SSL**
* Future expansion: backend APIs, Supabase/Convex integration, autoscaling, AI orchestration (CrewAI), and CI/CD

---

## **🏗️ Tech Stack**

| Layer            | Tools                                              |
| ---------------- | -------------------------------------------------- |
| Frontend         | React + Vite, TailwindCSS (optional), Lucide Icons |
| Container        | Docker, Nginx (SPA routing)                        |
| Cloud Deployment | Azure Container Apps                               |
| Image Registry   | Azure Container Registry (ACR)                     |
| Domain           | Custom DNS (CNAME + TXT verification)              |
| Certificates     | Azure Managed Certificates                         |
| Optional Backend | Supabase / Convex / FastAPI / Node.js              |
| CI/CD            | GitHub Actions (optional)                          |

---

## **📁 Project Structure**

```
nx-desk/
├── public/
│   └── assets/
│       └── (images, logos, static files)
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── Dockerfile
├── nginx.conf
├── .dockerignore
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

## **🚀 Local Development**

### **Install dependencies**

```bash
npm install
```

### **Run development server**

```bash
npm run dev
```

Open in browser:
➡ [http://localhost:5173](http://localhost:5173)

### **Build for production**

```bash
npm run build
```

Output is generated in `dist/`.

---

## **🐳 Docker (Production Build)**

### **Build the Docker image**

```bash
docker build -t nx-desk:latest .
```

### **Run the container**

```bash
docker run -p 8080:80 nx-desk:latest
```

App runs at:
➡ [http://localhost:8080](http://localhost:8080)

### **Dockerfile features**

* Multi-stage build (Node → Nginx)
* Optimized for production
* Nginx handles SPA routing using:

```nginx
try_files $uri $uri/ /index.html;
```

---

## **☁️ Deploying to Azure Container Apps**

### **1. Create Resource Group**

```bash
az group create --name nx-desk --location "Central India"
```

### **2. Create Azure Container Registry (ACR)**

```bash
az acr create --resource-group nx-desk --name nxdeskacrXXXX --sku Basic --admin-enabled true
```

### **3. Get ACR credentials**

```bash
az acr credential show --name nxdeskacrXXXX --resource-group nx-desk
```

### **4. Login & Push Docker Image**

```bash
docker login nxdeskacrXXXX.azurecr.io -u <username> -p <password>

docker tag nx-desk:latest nxdeskacrXXXX.azurecr.io/nx-desk:latest
docker push nxdeskacrXXXX.azurecr.io/nx-desk:latest
```

### **5. Create Container Apps Environment**

```bash
az containerapp env create \
  --name nxdesk-env \
  --resource-group nx-desk \
  --location "Central India"
```

### **6. Deploy Container App**

```bash
az containerapp create \
  --name nx-desk-app \
  --resource-group nx-desk \
  --environment nxdesk-env \
  --image nxdeskacrXXXX.azurecr.io/nx-desk:latest \
  --ingress external \
  --target-port 80 \
  --registry-server nxdeskacrXXXX.azurecr.io \
  --registry-username <username> \
  --registry-password <password>
```

### **7. Get public URL**

```bash
az containerapp show \
  --name nx-desk-app \
  --resource-group nx-desk \
  --query properties.configuration.ingress.fqdn \
  -o tsv
```

---

## **🌐 Custom Domain + HTTPS Setup**

### **1. Add CNAME in DNS**

```
Host: nxdesk
Type: CNAME
Value: <container-app-fqdn>
```

### **2. Add TXT Record for Domain Verification**

Azure will show something like:

```
Type: TXT
Host: asuid.nxdesk
Value: <verification-hash>
```

### **3. Validate Domain in Azure Portal**

Container App → Custom Domains → Add Domain → Validate

### **4. Create Managed Certificate**

Container Apps Environment → Certificates → Create Managed Certificate

### **5. Bind Certificate**

Container App → Custom domains → Add binding
Binding type: **SNI**
Certificate: **your issued certificate**

### **Final URL:**

➡ **[https://nxdesk.tech9labs.com](https://nxdesk.tech9labs.com)**

---

## **🔧 Environment Variables (Optional)**

For frontend build-time variables:

```
VITE_PUBLIC_API_URL=...
```

For Container App runtime env:

```bash
az containerapp update \
  --name nx-desk-app \
  --resource-group nx-desk \
  --set-env-vars "API_URL=https://example.com"
```

---

## **⚙️ Optional: GitHub Actions CI/CD**

Example workflow `.github/workflows/deploy.yml`:

```yaml
name: Build & Deploy NX-Desk

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}

      - name: Build Docker Image
        run: docker build -t nx-desk:latest .

      - name: ACR Login
        run: az acr login --name ${{ secrets.ACR_NAME }}

      - name: Tag & Push
        run: |
          docker tag nx-desk:latest ${{ secrets.ACR_NAME }}.azurecr.io/nx-desk:latest
          docker push ${{ secrets.ACR_NAME }}.azurecr.io/nx-desk:latest

      - name: Deploy to Container Apps
        run: |
          az containerapp update \
            --name nx-desk-app \
            --resource-group nx-desk \
            --image ${{ secrets.ACR_NAME }}.azurecr.io/nx-desk:latest
```

---

## **🩺 Troubleshooting**

### **🔴 SSL Certificate Pending**

* TXT record must be EXACT
* Wait 5–30 minutes
* Refresh Azure Portal

### **🔴 Domain not mapping**

Check:

```
dig nxdesk.tech9labs.com
dig asuid.nxdesk.tech9labs.com TXT
```

### **App shows blank screen**

* Missing SPA fallback in nginx.conf
* Incorrect Vite base path
* Dist folder not copied properly

---

## **📈 Roadmap**

✔ Azure deployment
✔ Docker containerization
✔ Custom domain & SSL
⬜ Add backend (Supabase / Convex / Node API)
⬜ Add AI agent backend (CrewAI, LangChain)
⬜ CI/CD automation
⬜ Autoscaling rules
⬜ Cloudflare WAF + CDN
⬜ Role-based admin dashboard

---

## **🤝 Contributing**

Pull requests are welcome.
Ensure consistent formatting and add documentation for new features.

---

## **📜 License**

MIT License — free for personal and commercial use.

