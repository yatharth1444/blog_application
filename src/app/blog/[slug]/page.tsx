import { notFound } from 'next/navigation';
import Image from 'next/image';
import CommentsSection from '@/components/blog/CommentsSection';

async function getPost(slug: string) {
  try {
    // First try to find by slug
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/posts/slug/${slug}`, {
      cache: 'no-store',
    });
    
    if (response.ok) {
      return await response.json();
    }
    
    // If not found by slug, try by ID (for backward compatibility)
    const responseById = await fetch(`${process.env.NEXTAUTH_URL}/api/posts/${slug}`, {
      cache: 'no-store',
    });
    
    if (responseById.ok) {
      return await responseById.json();
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-4xl mx-auto">
      {post.cover_image && (
        <div className="relative h-64 md:h-96 w-full mb-8">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}
      
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center text-gray-600 mb-4">
          <span>By {post.author_name}</span>
          <span className="mx-2">•</span>
          <span>{new Date(post.published_at).toLocaleDateString()}</span>
        </div>
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag: any) => (
              <span
                key={tag.id}
                className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </header>
      
      <div 
        className="prose max-w-none mb-12"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
      
      <CommentsSection postId={post.id} comments={post.comments || []} />
    </article>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  
  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }
  
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}