import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import supabase from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const emailStr = String(credentials.email).trim().toLowerCase();
        const passStr = String(credentials.password);

        try {
          const { data, error } = await supabase
            .from("users")
            .select("id, name, email, password, role, is_active")
            .eq("email", emailStr)
            .eq("is_active", 1)
            .limit(1)
            .single();

          if (error || !data) return null;

          const isValid = await bcrypt.compare(passStr, data.password);
          if (!isValid) return null;

          return {
            id: String(data.id),
            name: data.name,
            email: data.email,
            role: data.role,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET || "gacoan_secret_key_2026",
});
