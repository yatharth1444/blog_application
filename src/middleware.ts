import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const { pathname } = new URL(req.url);
      
      // Admin routes require admin role
      if (pathname.startsWith('/admin')) {
        return token?.role === 'admin';
      }
      
      // Protected routes require authentication
      if (pathname.startsWith('/profile') || 
          pathname.startsWith('/create-post') ||
          pathname.startsWith('/api/posts') && req.method !== 'GET') {
        return !!token;
      }
      
      return true;
    }
  }
});

export const config = {
  matcher: [
    '/admin/:path*', 
    '/profile/:path*', 
    '/create-post/:path*',
    '/api/posts/:path*'
  ]
};