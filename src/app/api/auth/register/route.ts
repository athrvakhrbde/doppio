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
    logger.warn('Rate limit exceeded for registration', { ip: clientIp });
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
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
    const { email, password, name } = await request.json();

    // Input validation
    if (!email || !password || !name) {
      logger.warn('Registration attempt with missing fields', { ip: clientIp });
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      logger.warn('Registration attempt with weak password', { ip: clientIp, email });
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      logger.warn('Registration attempt with invalid email', { ip: clientIp, email });
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 50) {
      logger.warn('Registration attempt with invalid name length', { ip: clientIp, name });
      return NextResponse.json(
        { error: 'Name must be between 2 and 50 characters' },
        { status: 400 }
      );
    }

    const existingUser = await kvStorage.getUserByEmail(email);

    if (existingUser) {
      logger.warn('Registration attempt with existing email', { ip: clientIp, email });
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = {
      id: Date.now().toString(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      name: name.trim(),
      createdAt: new Date().toISOString()
    };

    await kvStorage.createUser(newUser);

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    logger.logAuth('User registered successfully', newUser.id, newUser.email, clientIp);

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
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
    logger.logError(error as Error, { ip: clientIp, action: 'registration' });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
