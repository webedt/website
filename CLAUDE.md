# Website Project Documentation

This document provides information for AI assistants working on this project.

## Repository and Deployment Links

### GitHub Repository

This repository is available at:
```
https://github.com/webedt/website
```

### Deployment URLs

This project uses Dokploy for deployments. Each deployment gets a unique HTTPS subdomain following this pattern:

```
https://{deployment-identifier}.etdofresh.com/
```

The deployment identifier is typically constructed from the repository name, branch name, and session ID.

**Examples:**
```
https://webedt-website-01signhofzrrwp1vhsy58pmw.etdofresh.com/
https://website-claude-fix-sessions-api-error-01jbd4reujegugqwvnzhs8ae.etdofresh.com/
https://website-claude-delete-auth-option-016smpbawcs5dvprtnhaz4cc.etdofresh.com/
```

**Pattern breakdown:**
- `webedt-website-{sessionId}` - Repository + Session ID
- `website-{branch-name}-{sessionId}` - Repository + Branch + Session ID

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

**CRITICAL REQUIREMENT:** After completing ANY task that involves code changes, commits, or pushes, you MUST ALWAYS display clickable links to:

1. The GitHub repository (linked to the specific branch)
2. The deployment site (using the session ID pattern)

**Required Format:**

```
**Links:**

GitHub Branch: https://github.com/webedt/website/tree/{branch-name}
Live Site: https://{deployment-identifier}.etdofresh.com/
```

**How to construct the deployment URL:**

The deployment identifier follows this pattern:
- Format: `website-{branch-name-with-dashes}-{sessionId}`
- The branch name should have slashes replaced with dashes
- The sessionId is provided in the task context

**Example 1 - Branch: claude/fix-delete-modal-enter-01D495CooAjG8DPVRonWJ3tb**
```
**Links:**

GitHub Branch: https://github.com/webedt/website/tree/claude/fix-delete-modal-enter-01D495CooAjG8DPVRonWJ3tb
Live Site: https://website-claude-fix-delete-modal-enter-01d495cooajg8dpvronwj3tb.etdofresh.com/
```

**Example 2 - Branch: claude/fix-sessions-api-error-01jbd4reujegugqwvnzhs8ae**
```
**Links:**

GitHub Branch: https://github.com/webedt/website/tree/claude/fix-sessions-api-error-01jbd4reujegugqwvnzhs8ae
Live Site: https://website-claude-fix-sessions-api-error-01jbd4reujegugqwvnzhs8ae.etdofresh.com/
```

**Important Notes:**
- ALWAYS show these links at the end of your response when completing a task
- The deployment URL should be lowercase
- Do NOT skip this step - users rely on these links for quick access
- If logs are relevant, also include: `Deployment Logs: https://logs.etdofresh.com/{deployment-identifier}/`

## Project Overview

(Add project-specific information here as needed)

---

*Documentation last updated: 2025-11-16*
