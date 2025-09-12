'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            NextBlog
          </Link>

          <div className="flex space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Home
            </Link>
            <Link href="/blog" className="text-gray-700 hover:text-blue-600">
              Blog
            </Link>
            
            {status === 'loading' ? (
              <div>Loading...</div>
            ) : session ? (
              <>
                <Link href="/create-post" className="text-gray-700 hover:text-blue-600">
                  Write
                </Link>
                <Link href="/profile" className="text-gray-700 hover:text-blue-600">
                  Profile
                </Link>
                {session.user.role === 'admin' && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                    Admin
                  </Link>
                )}
                <button
                  onClick={() => signOut()}
                  className="text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Link>
                <Link href="/auth/signup" className="text-gray-700 hover:text-blue-600">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}