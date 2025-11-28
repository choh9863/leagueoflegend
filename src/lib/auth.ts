import { NextAuthOptions } from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';
import { users } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'discord') {
        // Discord 로그인 시 사용자 정보 저장/업데이트
        users.upsertByDiscordId(account.providerAccountId, {
          name: user.name || undefined,
          email: user.email || undefined,
          image: user.image || undefined,
        });
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        // Discord ID로 우리 DB의 사용자 정보 가져오기
        const dbUser = users.getByDiscordId(token.sub);
        if (dbUser) {
          session.user.id = dbUser.id;
          session.user.discordId = token.sub;
        }
      }
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
};
