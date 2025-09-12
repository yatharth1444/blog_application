import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const slug = params.slug;

    const postResult = await query(
      `SELECT p.*, u.username as author_name 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.slug = $1 AND p.published = true`,
      [slug]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = postResult.rows[0];

    // Get tags for the post
    const tagsResult = await query(
      `SELECT t.id, t.name, t.slug 
       FROM tags t 
       JOIN post_tags pt ON t.id = pt.tag_id 
       WHERE pt.post_id = $1`,
      [post.id]
    );

    // Get comments for the post
    const commentsResult = await query(
      `SELECT c.*, u.username as author_name 
       FROM comments c 
       JOIN users u ON c.author_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at DESC`,
      [post.id]
    );

    return NextResponse.json({
      ...post,
      tags: tagsResult.rows,
      comments: commentsResult.rows
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    );
  }
}