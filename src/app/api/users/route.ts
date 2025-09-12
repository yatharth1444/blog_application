import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { query } from '@/lib/db';

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const result = await query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    const countResult = await query('SELECT COUNT(*) FROM users');

    return NextResponse.json({
      users: result.rows,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create a new user (registration)
export async function POST(request: NextRequest) {
  try {
    const { username, email, password } = await request.json();

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    const result = await query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email, role, created_at',
      [username, email, hashedPassword]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}