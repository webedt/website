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

The deployment identifier is constructed from the repository owner, repository name, and session ID.

**Examples:**
```
https://webedt-website-01signhofzrrwp1vhsy58pmw.etdofresh.com/
https://webedt-website-01adzpk5b5h4bkydcmwtolgv.etdofresh.com/
https://webedt-website-01d495cooajg8dpvronwj3tb.etdofresh.com/
```

**Pattern:**
- Format: `{owner}-{repo}-{sessionId}`
- Example: `webedt-website-01adzpk5b5h4bkydcmwtolgv`
- The sessionId is a ULID extracted from the branch name
- All lowercase in the URL

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

GitHub Branch: [https://github.com/webedt/website/tree/{branch-name}](https://github.com/webedt/website/tree/{branch-name})
Live Site: [https://{deployment-identifier}.etdofresh.com/](https://{deployment-identifier}.etdofresh.com/)
```

**How to construct the deployment URL:**

The deployment identifier is generated using a progressive fallback strategy (based on DNS 63-character subdomain limit) from `.github/workflows/deploy-dokploy.yml`:

**Branch Name Processing:**
1. Convert to lowercase
2. Replace slashes with dashes
3. Example: `claude/debug-session-resumption-01AdzpK5b5h4BkyDcMWtoLGV` → `claude-debug-session-resumption-01adzpk5b5h4bkydcmwtolgv`

**Progressive Fallback Strategy:**
The workflow tries these formats in order, using the first one that fits within 63 characters:

1. **Strategy 1**: `{owner}-{repo}-{branch}` (most specific)
2. **Strategy 2**: `{repo}-{branch}` (drop owner)
3. **Strategy 3**: `{owner}-{repo}-{branchpart}` (extract unique ID from branch)
4. **Strategy 4**: `{repo}-{branchpart}`
5. **Strategy 5**: `{owner}-{repo}` (drop branch)
6. **Strategy 6**: `{repo}` (minimal)
7. **Strategy 7**: hash (last resort)

**For claude/ branches:**

The deployment identifier depends on the total length after processing:

1. **Process the branch name:**
   - Convert to lowercase
   - Replace slashes with dashes
   - Example: `claude/ideal-user-flow-01Ca8egaVDRvUdzutNsFZeAJ` → `claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj`

2. **Construct the deployment identifier:**
   - Try `{owner}-{repo}-{processed-branch}` first
   - Example: `webedt-website-claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj`
   - If this fits within 63 characters, use it
   - If it exceeds 63 characters, the workflow falls back to extracting just the session ID

3. **Check the length:**
   - Count characters in the full identifier
   - If ≤ 63 characters: use the full identifier with complete branch name
   - If > 63 characters: the workflow will extract just the session ID portion

**Simple Rule:**

Follow these steps to determine the deployment URL:

1. **Process the branch name:**
   - Convert to lowercase
   - Replace slashes with dashes
   - Example: `claude/setup-input-handling-01Prg9bKWaJvxQck5CGEGqUJ` → `claude-setup-input-handling-01prg9bkwajvxqck5cgegquj`

2. **Try Strategy 1:** `{owner}-{repo}-{processed-branch}`
   - Example: `webedt-website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj`
   - Count characters - if ≤ 63, use this

3. **Try Strategy 2:** `{repo}-{processed-branch}`
   - Example: `website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj`
   - Count characters - if ≤ 63, use this

4. **Continue with other fallback strategies** as needed (extracting session ID, etc.)

**Example 1 - Strategy 1 works (short branch name):**
```
Branch: claude/ideal-user-flow-01Ca8egaVDRvUdzutNsFZeAJ
Processed: claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj (52 chars)
Strategy 1: webedt-website-claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj (61 chars ✓)

**Links:**

GitHub Branch: [https://github.com/webedt/website/tree/claude/ideal-user-flow-01Ca8egaVDRvUdzutNsFZeAJ](https://github.com/webedt/website/tree/claude/ideal-user-flow-01Ca8egaVDRvUdzutNsFZeAJ)
Live Site: [https://webedt-website-claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj.etdofresh.com/](https://webedt-website-claude-ideal-user-flow-01ca8egavdrvudzutnsfzeaj.etdofresh.com/)
```

**Example 2 - Strategy 2 works (medium branch name):**
```
Branch: claude/setup-input-handling-01Prg9bKWaJvxQck5CGEGqUJ
Processed: claude-setup-input-handling-01prg9bkwajvxqck5cgegquj (52 chars)
Strategy 1: webedt-website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj (68 chars ✗)
Strategy 2: website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj (60 chars ✓)

**Links:**

GitHub Branch: [https://github.com/webedt/website/tree/claude/setup-input-handling-01Prg9bKWaJvxQck5CGEGqUJ](https://github.com/webedt/website/tree/claude/setup-input-handling-01Prg9bKWaJvxQck5CGEGqUJ)
Live Site: [https://website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj.etdofresh.com/](https://website-claude-setup-input-handling-01prg9bkwajvxqck5cgegquj.etdofresh.com/)
```

**Example 3 - Strategy 3+ needed (long branch name):**
```
Branch: claude/debug-session-resumption-01AdzpK5b5h4BkyDcMWtoLGV
Processed: claude-debug-session-resumption-01adzpk5b5h4bkydcmwtolgv (57 chars)
Strategy 1: webedt-website-claude-debug-session-resumption-01adzpk5b5h4bkydcmwtolgv (73 chars ✗)
Strategy 2: website-claude-debug-session-resumption-01adzpk5b5h4bkydcmwtolgv (66 chars ✗)
Fallback to session ID: website-01adzpk5b5h4bkydcmwtolgv (35 chars ✓)

**Links:**

GitHub Branch: [https://github.com/webedt/website/tree/claude/debug-session-resumption-01AdzpK5b5h4BkyDcMWtoLGV](https://github.com/webedt/website/tree/claude/debug-session-resumption-01AdzpK5b5h4BkyDcMWtoLGV)
Live Site: [https://website-01adzpk5b5h4bkydcmwtolgv.etdofresh.com/](https://website-01adzpk5b5h4bkydcmwtolgv.etdofresh.com/)
```

**Important Notes:**
- ALWAYS show these links at the end of your response when completing a task
- The deployment URL should be lowercase
- Do NOT skip this step - users rely on these links for quick access
- If logs are relevant, also include: `Deployment Logs: [https://logs.etdofresh.com/{deployment-identifier}/](https://logs.etdofresh.com/{deployment-identifier}/)`

## Project Overview

(Add project-specific information here as needed)

---

*Documentation last updated: 2025-11-16*
