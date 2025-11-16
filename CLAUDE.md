# Website Project Documentation

This document provides information for AI assistants working on this project.

## Repository and Deployment Links

### GitHub Repository

This repository is available at:
```
https://github.com/webedt/website
```

### Deployment URLs

If this project uses a deployment system similar to the parent WebEdt platform, deployed sessions will have unique HTTPS URLs following this pattern:

```
https://{DOKPLOY_DOMAIN_HOST}/{sessionId}
```

Example:
```
https://codex-webapp.etdofresh.com/3dbb084b-ab96-46df-b90d-f1b130b245c7
```

### Viewing Deployment Logs

If deployed via Dokploy, build and deployment logs can be accessed at:

```
https://logs.etdofresh.com/
```

To view logs for a specific deployment:
```
https://logs.etdofresh.com/{sessionId}-{suffix}/
```

To view a specific deployment log file:
```
https://logs.etdofresh.com/{sessionId}-{suffix}/{logfile}.log
```

#### Programmatic Access to Logs

You can combine the Dokploy API with the log viewer to get exact log URLs:

```javascript
async function getDeploymentLogs(sessionId) {
  // 1. Get application details from Dokploy API
  const appResponse = await fetch(
    `https://dokploy.etdofresh.com/api/application.one?applicationId=${sessionId}`,
    {
      headers: {
        'accept': 'application/json',
        'x-api-key': process.env.DOKPLOY_API_KEY
      }
    }
  );

  const appData = await appResponse.json();

  // 2. Get the latest deployment log path
  const deployment = appData.deployments[0];
  const logPath = deployment.logPath;
  // Example: "/etc/dokploy/logs/abc-123/abc-123-2025-11-03:21:39:32.log"

  // 3. Convert to logs.etdofresh.com URL
  const logUrl = logPath.replace('/etc/dokploy/logs/', 'https://logs.etdofresh.com/');

  // 4. Fetch or display
  console.log('View logs at:', logUrl);

  // Optional: Fetch the log content
  const logResponse = await fetch(logUrl);
  const logContent = await logResponse.text();

  return { logUrl, logContent };
}
```

### Displaying Links to Users

When completing tasks that involve deployment or repository access, display the relevant links in this format:

**Repository:**
```
GitHub: https://github.com/webedt/website
```

**Deployment** (if applicable):
```
Live Site: https://{DOKPLOY_DOMAIN_HOST}/{sessionId}
```

**Logs** (if applicable):
```
Deployment Logs: https://logs.etdofresh.com/{sessionId}-{suffix}/
```

## Project Overview

(Add project-specific information here as needed)

---

*Documentation last updated: 2025-11-16*
