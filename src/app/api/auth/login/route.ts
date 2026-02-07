import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { kvStorage } from '@/lib/kv-storage';
import { authRateLimiter } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0] : realIp || 'unknown';
  return ip;
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIdentifier(request);
  
  // Rate limiting
  if (!authRateLimiter.isAllowed(clientIp)) {
    logger.warn('Rate limit exceeded for login', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': authRateLimiter.getResetTime(clientIp).toString()
        }
      }
    );
  }

  try {
    const { email, password } = await request.json();

    // Input validation
    if (!email || !password) {
      logger.warn('Login attempt with missing credentials', { ip: clientIp });
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn('Login attempt with invalid email', { ip: clientIp, email });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const users = await kvStorage.getUsers();
    const user = users.find(u => u.email === email.toLowerCase().trim());

    if (!user) {
      logger.warn('Login attempt with non-existent user', { ip: clientIp, email });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      logger.warn('Login attempt with invalid password', { ip: clientIp, email, userId: user.id });
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.logAuth('User logged in successfully', user.id, user.email, clientIp);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      },
      token
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': authRateLimiter.getRemainingRequests(clientIp).toString(),
        'X-RateLimit-Reset': authRateLimiter.getResetTime(clientIp).toString()
      }
    });

  } catch (error) {
    logger.logError(error as Error, { ip: clientIp, action: 'login' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
