import { query } from '@/lib/db';

export async function initializeDatabase() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create posts table
    await query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        excerpt TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        cover_image TEXT,
        published BOOLEAN DEFAULT FALSE,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        published_at TIMESTAMP
      );
    `);

    // Create comments table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        author_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tags table
    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        slug VARCHAR(50) UNIQUE NOT NULL,
        description TEXT
      );
    `);

    // Create post_tags junction table
    await query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
        tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, tag_id)
      );
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);');
    await query('CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published);');
    await query('CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON post_tags(post_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_post_tags_tag_id ON post_tags(tag_id);');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}