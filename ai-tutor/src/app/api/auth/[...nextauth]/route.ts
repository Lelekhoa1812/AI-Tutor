import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";
import type { Prisma } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  debug: true,
  session: {
    strategy: "jwt",
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
              (acc) => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
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
  events: {
    async signIn(message: any) {
      console.log('SignIn Event:', message);
    },
    async signOut(message: any) {
      console.log('SignOut Event:', message);
    },
  },
  pages: {
    error: '/auth/error',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 