import { Lucia } from 'lucia';
import { NodePostgresAdapter } from '@lucia-auth/adapter-postgresql';
import { pool } from './db/index';

const adapter = new NodePostgresAdapter(pool, {
  user: 'users',
  session: 'sessions',
});

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      email: attributes.email,
      githubId: attributes.github_id,
      githubAccessToken: attributes.github_access_token,
      claudeAuth: attributes.claude_auth ? (typeof attributes.claude_auth === 'string' ? JSON.parse(attributes.claude_auth) : attributes.claude_auth) : null,
    };
  },
});

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: {
      email: string;
      github_id: string | null;
      github_access_token: string | null;
      claude_auth: string | null;
    };
  }
}
