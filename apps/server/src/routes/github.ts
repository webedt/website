import { Router } from 'express';
import { Octokit } from '@octokit/rest';
import { db } from '../db/index-sqlite';
import { users } from '../db/schema-sqlite';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Initiate GitHub OAuth
router.get('/oauth', requireAuth, (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_OAUTH_CLIENT_ID!,
    redirect_uri: process.env.GITHUB_OAUTH_REDIRECT_URL!,
    scope: 'repo user:email',
    state: Math.random().toString(36).substring(7), // CSRF protection
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

// GitHub OAuth callback
router.get('/oauth/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    const authReq = req as AuthRequest;

    // Check if user is authenticated
    if (!authReq.user) {
      res.redirect(`${process.env.ALLOWED_ORIGINS?.split(',')[0]}/login?error=not_authenticated`);
      return;
    }

    if (!code) {
      res.redirect(`${process.env.ALLOWED_ORIGINS?.split(',')[0]}/settings?error=no_code`);
      return;
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = (await tokenResponse.json()) as {
      access_token?: string;
      error?: string;
    };

    if (tokenData.error) {
      res.redirect(
        `${process.env.ALLOWED_ORIGINS?.split(',')[0]}/settings?error=${tokenData.error}`
      );
      return;
    }

    const accessToken = tokenData.access_token;

    // Get GitHub user info
    const octokit = new Octokit({ auth: accessToken });
    const { data: githubUser } = await octokit.users.getAuthenticated();

    // Update user with GitHub info
    await db
      .update(users)
      .set({
        githubId: String(githubUser.id),
        githubAccessToken: accessToken,
      })
      .where(eq(users.id, authReq.user.id));

    res.redirect(`${process.env.ALLOWED_ORIGINS?.split(',')[0]}/settings?success=github_connected`);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.ALLOWED_ORIGINS?.split(',')[0]}/settings?error=oauth_failed`);
  }
});

// Get user's repositories
router.get('/repos', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user?.githubAccessToken) {
      res.status(400).json({ success: false, error: 'GitHub not connected' });
      return;
    }

    const octokit = new Octokit({ auth: authReq.user.githubAccessToken });
    const { data: repos } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    const formattedRepos = repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      description: repo.description,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      defaultBranch: repo.default_branch,
    }));

    res.json({ success: true, data: formattedRepos });
  } catch (error) {
    console.error('GitHub repos error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch repositories' });
  }
});

// Get repository branches
router.get('/repos/:owner/:repo/branches', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;
    const { owner, repo } = req.params;

    if (!authReq.user?.githubAccessToken) {
      res.status(400).json({ success: false, error: 'GitHub not connected' });
      return;
    }

    const octokit = new Octokit({ auth: authReq.user.githubAccessToken });
    const { data: branches } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    const formattedBranches = branches.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
      commit: {
        sha: branch.commit.sha,
        url: branch.commit.url,
      },
    }));

    res.json({ success: true, data: formattedBranches });
  } catch (error) {
    console.error('GitHub branches error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch branches' });
  }
});

// Disconnect GitHub
router.post('/disconnect', requireAuth, async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    await db
      .update(users)
      .set({
        githubId: null,
        githubAccessToken: null,
      })
      .where(eq(users.id, authReq.user!.id));

    res.json({ success: true, data: { message: 'GitHub disconnected' } });
  } catch (error) {
    console.error('GitHub disconnect error:', error);
    res.status(500).json({ success: false, error: 'Failed to disconnect GitHub' });
  }
});

export default router;
