import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

import type { AuthUserFields } from "@/types";

declare module "next-auth" {
  interface Session {
    user: AuthUserFields & DefaultSession["user"];
  }

  interface User extends DefaultUser, AuthUserFields {}
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT, AuthUserFields {}
}
