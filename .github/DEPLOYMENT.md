# Deployment Guide for WebEDT

This document describes how to deploy the WebEDT application to Dokploy using GitHub Actions.

## Overview

The deployment process is fully automated using GitHub Actions. When you push code to any branch, the workflow will:

1. **Create or update a Dokploy application** for that branch
2. **Configure the application** with the correct settings (Dockerfile, replicas, environment variables)
3. **Set up a unique subdomain** for the branch (e.g., `webedt-website-main.etdofresh.com`)
4. **Deploy the application** automatically (on first creation only)
5. **Clean up** the application when the branch is deleted

## Prerequisites

Before you can use the automated deployment, you need to:

1. **Dokploy instance** - A running Dokploy server
2. **GitHub repository** - This repository with GitHub Actions enabled
3. **Self-hosted runner** - A GitHub Actions runner that can access your Dokploy instance

## Initial Setup

### Step 1: Get Dokploy IDs

Run the helper script to retrieve your Dokploy configuration:

```bash
chmod +x .github/get-dokploy-ids.sh
.github/get-dokploy-ids.sh
```

This script will prompt you for:
- **Dokploy URL** (e.g., `https://dokploy.yourdomain.com`)
- **Dokploy API Key** (found in Dokploy Settings > API Keys)

It will then display all projects, environments, and the required configuration values.

### Step 2: Configure GitHub Variables

Navigate to your GitHub repository:
**Settings > Secrets and variables > Actions > Variables**

Add these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DOKPLOY_URL` | Your Dokploy instance URL | `https://dokploy.example.com` |
| `DOKPLOY_PROJECT_ID` | Project ID from the script | `clxxx...` |
| `DOKPLOY_ENVIRONMENT_ID` | Environment ID from the script | `clxxx...` |
| `DOKPLOY_GITHUB_ID` | GitHub integration ID (Dokploy Settings > GitHub) | `clxxx...` |
| `DOKPLOY_SERVER_ID` | Server ID (Dokploy Servers page) | `clxxx...` |

### Step 3: Configure GitHub Secrets

Navigate to your GitHub repository:
**Settings > Secrets and variables > Actions > Secrets**

Add these secrets:

| Secret | Value | Required |
|--------|-------|----------|
| `DOKPLOY_API_KEY` | API key from Dokploy | ✅ Required |
| `DATABASE_URL` | PostgreSQL connection string | ❌ Optional (SQLite used if not set) |
| `SESSION_SECRET` | Random secret for sessions | ⚠️ Recommended |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub OAuth App Client ID | ❌ Optional |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub OAuth App Client Secret | ❌ Optional |
| `GITHUB_OAUTH_REDIRECT_URL` | OAuth callback URL | ❌ Optional |
| `AI_WORKER_URL` | AI Coding Worker URL | ❌ Optional |

**Note:** If `SESSION_SECRET` is not provided, a random one will be generated. However, this means sessions won't persist across deployments.

### Step 4: Verify Configuration

Once configured, push a commit to test the deployment:

```bash
git push origin main
```

The GitHub Actions workflow will:
1. Create an application named `{owner}-{repo}-{branch}` (e.g., `webedt-webedt-website-main`)
2. Configure it to build from the `Dockerfile` in the repository root
3. Set up a domain: `{domain-name}.etdofresh.com`
4. Deploy the application

## How It Works

### Dockerfile

The repository includes a multi-stage Dockerfile that:

1. **Installs dependencies** using pnpm workspaces
2. **Builds the shared package** (`@webedt/shared`)
3. **Builds the client** (React/Vite app) to `apps/client/dist`
4. **Builds the server** (Express API) to `apps/server/dist`
5. **Creates a production image** with only runtime dependencies
6. **Serves the application** on port 3000

The server serves both the API endpoints and the built frontend files.

### GitHub Actions Workflows

#### Deploy Workflow (`.github/workflows/deploy-dokploy.yml`)

Triggers on:
- `push` to any branch
- Manual dispatch (`workflow_dispatch`)

Steps:
1. **Generate metadata** - Creates unique application name and DNS-compliant domain name
2. **Get or create application** - Checks if application exists, creates if needed
3. **Configure GitHub provider** - Links the GitHub repository for automatic builds
4. **Set environment variables** - Configures runtime environment
5. **Deploy** - Triggers Dokploy deployment (only on first creation)

#### Cleanup Workflow (`.github/workflows/cleanup-dokploy.yml`)

Triggers on:
- `delete` of any branch

Steps:
1. **Generate application name** - Reconstructs the name from the deleted branch
2. **Find and delete** - Locates the Dokploy application and deletes it

### Domain Naming Strategy

The workflow uses a progressive fallback strategy to ensure domain names fit within the 63-character DNS subdomain limit:

1. `{owner}-{repo}-{branch}` (most specific)
2. `{repo}-{branch}` (drop owner)
3. `{owner}-{repo}-{branch-part}` (extract PR/issue number)
4. `{repo}-{branch-part}`
5. `{owner}-{repo}` (drop branch)
6. `{repo}` (drop owner and branch)
7. Hash (last resort)

Example:
- Branch: `feature/add-new-dashboard`
- Domain: `webedt-website-feature-add-new-dashboard.etdofresh.com`

## Environment Variables

The following environment variables are automatically configured in Dokploy:

| Variable | Source | Default |
|----------|--------|---------|
| `DATABASE_URL` | GitHub Secret | (Uses SQLite if not set) |
| `SESSION_SECRET` | GitHub Secret | (Auto-generated if not set) |
| `GITHUB_OAUTH_CLIENT_ID` | GitHub Secret | - |
| `GITHUB_OAUTH_CLIENT_SECRET` | GitHub Secret | - |
| `GITHUB_OAUTH_REDIRECT_URL` | GitHub Secret | - |
| `AI_WORKER_URL` | GitHub Secret | - |
| `NODE_ENV` | Auto-set | `production` |
| `PORT` | Auto-set | `3000` |

## Deployment Behavior

### First Deployment

When a new application is created, the workflow will:
1. Create the Dokploy application
2. Configure GitHub integration
3. Set up the domain with Let's Encrypt SSL
4. **Trigger a deployment**

### Subsequent Pushes

For existing applications, the workflow will:
1. Update the GitHub provider configuration
2. Update environment variables if changed
3. **Skip deployment** - Dokploy will auto-deploy based on webhook

This means you only get one deployment per application creation. To trigger a deployment on subsequent pushes, you can manually trigger it in Dokploy.

## Troubleshooting

### Application not deploying

1. Check GitHub Actions logs for errors
2. Verify all required secrets and variables are set
3. Check Dokploy logs for build errors
4. Ensure the Dockerfile builds successfully locally:
   ```bash
   docker build -t webedt-test .
   ```

### Domain not accessible

1. Wait for Let's Encrypt certificate generation (can take a few minutes)
2. Check DNS records for `*.etdofresh.com`
3. Verify the domain was created in Dokploy

### Environment variables not applied

1. Re-run the workflow to update configuration
2. Manually check environment variables in Dokploy UI
3. Verify secrets are correctly set in GitHub

### Database connection issues

1. Ensure `DATABASE_URL` is correctly formatted
2. Check network connectivity from Dokploy server to database
3. Verify database credentials

## Manual Deployment

To manually trigger a deployment without pushing code:

1. Go to **Actions** tab in GitHub
2. Select **Deploy to Dokploy** workflow
3. Click **Run workflow**
4. Select the branch to deploy

## Cleanup

Applications are automatically cleaned up when branches are deleted. To manually delete an application:

1. Delete the branch in GitHub
2. Wait for the cleanup workflow to complete
3. Or manually delete in Dokploy UI

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                 GitHub Repository                    │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │   Client   │  │   Server   │  │   Shared   │   │
│  │  (Vite)    │  │ (Express)  │  │  (Types)   │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│         │                │                │         │
│         └────────┬───────┴────────────────┘         │
│                  │                                   │
│         ┌────────▼────────┐                         │
│         │   Dockerfile    │                         │
│         └────────┬────────┘                         │
└──────────────────┼──────────────────────────────────┘
                   │
                   │ GitHub Actions
                   │
           ┌───────▼────────┐
           │     Dokploy    │
           │  ┌──────────┐  │
           │  │  Build   │  │
           │  └────┬─────┘  │
           │       │        │
           │  ┌────▼─────┐  │
           │  │  Deploy  │  │
           │  └────┬─────┘  │
           │       │        │
           │  ┌────▼─────┐  │
           │  │  Serve   │  │
           │  │ Port 3000│  │
           │  └──────────┘  │
           └────────────────┘
                   │
                   │ HTTPS
                   │
        ┌──────────▼──────────┐
        │   {domain}.         │
        │   etdofresh.com     │
        │   (Let's Encrypt)   │
        └─────────────────────┘
```

## Support

For issues with:
- **GitHub Actions** - Check workflow logs and this documentation
- **Dokploy** - Check Dokploy documentation and server logs
- **Application code** - See main README.md and QUICKSTART.md

## Additional Resources

- [Dokploy Documentation](https://docs.dokploy.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
