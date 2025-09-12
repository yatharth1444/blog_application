import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/comments - Get comments for a post
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const result = await query(
      `SELECT c.*, u.username as author_name 
       FROM comments c 
       JOIN users u ON c.author_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at DESC`,
      [postId]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/comments - Create a new comment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { content, postId, parentId } = await request.json();

    if (!content || !postId) {
      return NextResponse.json(
        { error: 'Content and post ID are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO comments (content, author_id, post_id, parent_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [content, session.user.id, postId, parentId || null]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}