import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { upsertUser } from "./db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;
      try {
        const dbUser = await upsertUser({
          provider: account.provider,
          provider_id: account.providerAccountId,
          email: user.email,
          name: user.name,
          avatar_url: user.image,
          github_username: account.provider === "github" ? (profile as { login?: string })?.login ?? null : null,
        });
        // Store db user id for JWT
        user.id = dbUser.id;
      } catch {
        // DB not available in edge, allow login anyway
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.userId = user.id;
        token.provider = account?.provider;
        token.githubUsername = account?.provider === "github" ? (profile as { login?: string })?.login : undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).provider = token.provider;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).githubUsername = token.githubUsername;
      }
      return session;
    },
  },
});
