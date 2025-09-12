import Link from 'next/link';
import Image from 'next/image';

interface Post {
  id: number;
  title: string;
  excerpt: string;
  slug: string;
  cover_image: string;
  published_at: string;
  author_name: string;
}

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {post.cover_image && (
        <div className="relative h-48 w-full">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
            {post.title}
          </Link>
        </h2>
        <p className="text-gray-600 mb-4">{post.excerpt}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            By {post.author_name}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(post.published_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </article>
  );
}