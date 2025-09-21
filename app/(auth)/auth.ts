//app/(auth)/auth.ts
import { compare } from "bcrypt-ts";
import NextAuth, { type User, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

import { getUser, createUser } from "@/lib/db/queries";

import { authConfig } from "./auth.config";

interface ExtendedSession extends Session {
  user: User;
}

const GOOGLE_CLIENT_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

if (!GOOGLE_CLIENT_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth environment variables");
}

if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error("Missing GitHub OAuth environment variables");
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {},
      async authorize({ email, password }: any) {
        const users = await getUser(email);
        if (users.length === 0) return null;
        // biome-ignore lint: Forbidden non-null assertion.
        const passwordsMatch = await compare(password, users[0].passwordHash!);
        if (!passwordsMatch) return null;
        return users[0] as any;
      },
    }),
    GoogleProvider({
      clientId: GOOGLE_CLIENT_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      } else if (token.email) {
        const users = await getUser(token.email);
        if (users.length > 0) {
          token.id = users[0].id;
        }
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: any;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        if (user?.email) {
          let users = await getUser(user.email);
          if (users.length === 0) {
            // Extract name information from the OAuth profile
            let firstName = "";
            let lastName = "";
            
            if (user.name) {
              const nameParts = user.name.split(" ");
              firstName = nameParts[0] || "";
              lastName = nameParts.slice(1).join(" ") || "";
            }
            
            // Fallback to profile data if available
            if (!firstName && profile) {
              if (account.provider === "google") {
                firstName = (profile as any).given_name || "";
                lastName = (profile as any).family_name || "";
              } else if (account.provider === "github") {
                // GitHub doesn't provide separate first/last names, so split the name
                const name = (profile as any).name || user.name || "";
                const nameParts = name.split(" ");
                firstName = nameParts[0] || "";
                lastName = nameParts.slice(1).join(" ") || "";
              }
            }
            
            // Ensure we have at least some name data
            if (!firstName) firstName = "User";
            if (!lastName) lastName = "";
            
            await createUser({
              firstName,
              lastName,
              riceEmail: user.email,
              // phoneNumber and passwordPlain are optional for OAuth users
            });
            users = await getUser(user.email);
          }
          user.id = users[0].id;
        } else {
          console.error("No email provided by OAuth provider");
          return false;
        }
      }
      return true;
    },
  },
});
