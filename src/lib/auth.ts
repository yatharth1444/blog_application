import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { query } from './db';

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const result = await query(
          'SELECT * FROM users WHERE email = $1',
          [credentials.email]
        );

        if (result.rows.length === 0) {
          return null;
        }

        const user = result.rows[0];
        const isValid = await compare(credentials.password, user.password_hash);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
};

export default NextAuth(authOptions);