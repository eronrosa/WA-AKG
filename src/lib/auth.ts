import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";
import { clearLoginFailures, loginLockSeconds, recordLoginFailure } from "@/lib/login-limit";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;

          // Too many wrong passwords for this account: refuse before checking the password
          if (loginLockSeconds(email) > 0) return null;

          const user = await prisma.user.findUnique({ where: { email } });
          if (!user) {
            recordLoginFailure(email);
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (passwordsMatch) {
            clearLoginFailures(email);
            return user;
          }
          recordLoginFailure(email);
        }
        return null;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,
});
