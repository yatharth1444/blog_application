import PostList from '@/components/blog/PostList';

export default function BlogPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>
      <PostList />
    </div>
  );
}