import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'
import GoogleProvider from 'next-auth/providers/google'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import type { Account as NextAuthAccount } from 'next-auth'

const prismaClient = new PrismaClient()

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log('SignIn Callback - Start:', { user, account, profile });
        
        if (account?.provider === 'google' && user.email) {
          console.log('Attempting to find or create user for email:', user.email);
          
          // First, try to find the user by email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            include: {
              accounts: true,
            },
          });

          if (!existingUser) {
            console.log('Creating new user with data:', {
              email: user.email,
              name: user.name || '',
            });
            
            // Create new user with account
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || '',
                accounts: {
                  create: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    type: account.type,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                },
              },
            });
            console.log('New user created:', newUser);
          } else {
            console.log('Existing user found:', existingUser);
            
            // Check if the account is already linked
            const existingAccount = existingUser.accounts.find(
              (acc: NextAuthAccount) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
            );

            if (!existingAccount) {
              console.log('Linking new account to existing user');
              // Link the new account to the existing user
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
            }
          }
        }
        return true;
      } catch (error) {
        console.error('SignIn Error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      console.log('Session Callback:', { session, token });
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      console.log('JWT Callback:', { token, user, account });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  events: {
    async signIn(message: any) {
      console.log('SignIn Event:', message);
    },
    async signOut(message: any) {
      console.log('SignOut Event:', message);
    },
  },
}

export async function getCurrentUser() {
  try {
    const token = cookies().get('token')?.value

    if (!token) {
      return null
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string }

    const user = await prismaClient.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user
  } catch (error) {
    return null
  }
} 