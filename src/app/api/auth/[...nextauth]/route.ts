import NextAuth from "next-auth";

import { authOptions } from "@/lib/auth";

const HANDLER = NextAuth(authOptions);

export { HANDLER as GET, HANDLER as POST };
