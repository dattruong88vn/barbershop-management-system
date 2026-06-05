import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { authTexts } from "@/constants/texts";
import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE_SECONDS,
    updateAge: SESSION_UPDATE_AGE_SECONDS,
  },
  jwt: {
    maxAge: SESSION_MAX_AGE_SECONDS,
  },
  providers: [
    CredentialsProvider({
      name: authTexts.credentialsProvider.name,
      credentials: {
        username: { label: authTexts.credentialsProvider.usernameLabel, type: "text" },
        password: {
          label: authTexts.credentialsProvider.passwordLabel,
          type: "password",
        },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;

        if (!username || !password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { username },
          select: {
            id: true,
            role: true,
            shopId: true,
            branchId: true,
            username: true,
            passwordHash: true,
            isFirstLogin: true,
          },
        });

        if (!user || !verifyPassword(password, user.passwordHash)) {
          return null;
        }

        return {
          id: user.id,
          role: user.role,
          shop_id: user.shopId,
          branch_id: user.branchId,
          username: user.username,
          is_first_login: user.isFirstLogin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.shop_id = user.shop_id;
        token.branch_id = user.branch_id;
        token.username = user.username;
        token.is_first_login = user.is_first_login;
      }

      if (trigger === "update" && session?.user?.is_first_login !== undefined) {
        token.is_first_login = session.user.is_first_login;
      }

      return token;
    },
    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        role: token.role,
        shop_id: token.shop_id,
        branch_id: token.branch_id,
        username: token.username,
        is_first_login: token.is_first_login,
      };

      return session;
    },
  },
};
