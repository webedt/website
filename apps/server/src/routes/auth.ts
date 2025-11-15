import { Router } from 'express';
import bcrypt from 'bcrypt';
import { db } from '../db/index-sqlite';
import { users } from '../db/schema-sqlite';
import { lucia } from '../auth-sqlite';
import { eq } from 'drizzle-orm';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters' });
      return;
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) {
      res.status(400).json({ success: false, error: 'Email already in use' });
      return;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
      })
      .returning();

    // Create session
    const session = await lucia.createSession(newUser.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .status(201)
      .appendHeader('Set-Cookie', sessionCookie.serialize())
      .json({
        success: true,
        data: {
          user: {
            id: newUser.id,
            email: newUser.email,
            githubId: newUser.githubId,
            githubAccessToken: newUser.githubAccessToken,
            claudeAuth: newUser.claudeAuth,
          },
        },
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required' });
      return;
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      res.status(400).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);

    if (!validPassword) {
      res.status(400).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    res
      .appendHeader('Set-Cookie', sessionCookie.serialize())
      .json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            githubId: user.githubId,
            githubAccessToken: user.githubAccessToken,
            claudeAuth: user.claudeAuth,
          },
        },
      });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.session) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    await lucia.invalidateSession(authReq.session.id);
    const blankCookie = lucia.createBlankSessionCookie();

    res
      .appendHeader('Set-Cookie', blankCookie.serialize())
      .json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get current session
router.get('/session', async (req, res) => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.user || !authReq.session) {
      res.status(401).json({ success: false, error: 'Unauthorized' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: authReq.user,
        session: authReq.session,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
