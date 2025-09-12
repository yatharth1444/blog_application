import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { query } from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET /api/posts/[id] - Get a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const postId = params.id;

    const postResult = await query(
      `SELECT p.*, u.username as author_name 
       FROM posts p 
       JOIN users u ON p.author_id = u.id 
       WHERE p.id = $1`,
      [postId]
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
      [postId]
    );

    // Get comments for the post
    const commentsResult = await query(
      `SELECT c.*, u.username as author_name 
       FROM comments c 
       JOIN users u ON c.author_id = u.id 
       WHERE c.post_id = $1 
       ORDER BY c.created_at DESC`,
      [postId]
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

// PUT /api/posts/[id] - Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const { title, content, excerpt, tags, cover_image, published } = await request.json();

    // Check if user owns the post or is admin
    const postResult = await query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (postResult.rows[0].author_id !== parseInt(session.user.id) && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update post
    const updateData: any = {
      title, content, excerpt, cover_image, published
    };

    if (published) {
      updateData.published_at = new Date();
    }

    const result = await query(
      `UPDATE posts 
       SET title = $1, content = $2, excerpt = $3, cover_image = $4, published = $5, published_at = $6, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $7 
       RETURNING *`,
      [title, content, excerpt, cover_image, published, updateData.published_at, postId]
    );

    // Handle tags if provided
    if (tags) {
      // Remove existing tags
      await query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

      // Add new tags
      for (const tagName of tags) {
        // Check if tag exists, create if not
        let tagResult = await query(
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
          [postId, tagId]
        );
      }
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[id] - Delete a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = params.id;

    // Check if user owns the post or is admin
    const postResult = await query(
      'SELECT author_id FROM posts WHERE id = $1',
      [postId]
    );

    if (postResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    if (postResult.rows[0].author_id !== parseInt(session.user.id) && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete post
    await query('DELETE FROM posts WHERE id = $1', [postId]);

    return NextResponse.json({ message: 'Post deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete post' },
      { status: 500 }
    );
  }
}