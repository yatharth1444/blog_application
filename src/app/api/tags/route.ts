import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/tags - Get all tags
export async function GET(request: NextRequest) {
  try {
    const result = await query(
      'SELECT * FROM tags ORDER BY name'
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}