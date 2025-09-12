import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/posts - Get all published posts with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT p.*, u.username as author_name 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.published = true 
       ORDER BY p.published_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM posts WHERE published = true'
    );

    return NextResponse.json({
      posts: result.rows,
      totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit),
      currentPage: page
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post (authenticated users only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, excerpt, tags, cover_image } = await request.json();
    
    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Insert post
    const result = await query(
      `INSERT INTO posts (title, content, excerpt, slug, author_id, cover_image) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [title, content, excerpt, slug, session.user.id, cover_image]
    );

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists, create if not
        const tagResult = await query(
          'SELECT id FROM tags WHERE name = $1',
          [tagName]
        );
        
        let tagId;
        if (tagResult.rows.length === 0) {
          const newTag = await query(
            'INSERT INTO tags (name, slug) VALUES ($1, $2) RETURNING id',
            [tagName, tagName.toLowerCase().replace(/\s+/g, '-')]
          );
          tagId = newTag.rows[0].id;
        } else {
          tagId = tagResult.rows[0].id;
        }
        
        // Link tag to post
        await query(
          'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2)',
          [result.rows[0].id, tagId]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}