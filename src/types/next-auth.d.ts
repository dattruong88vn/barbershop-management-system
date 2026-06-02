import type { UserRole } from "@prisma/client";
import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

type AuthUserFields = {
  id: string;
  role: UserRole;
  shop_id: string | null;
  branch_id: string | null;
  username: string;
  is_first_login: boolean;
};

declare module "next-auth" {
  interface Session {
    user: AuthUserFields & DefaultSession["user"];
  }

  interface User extends DefaultUser, AuthUserFields {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, AuthUserFields {}
}
