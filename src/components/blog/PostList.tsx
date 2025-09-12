'use client';

import { useState, useEffect } from 'react';
import PostCard from './PostCard';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string;
  published_at: string;
  author_name: string;
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/posts?page=${page}&limit=6`);
      const data = await response.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading posts...</div>;
  }

  if (posts.length === 0) {
    return <div className="text-center py-8">No posts found.</div>;
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      
      <div className="flex justify-center mt-8 space-x-2">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Previous
        </button>
        <span className="px-4 py-2">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}