import Google from "next-auth/providers/google"
import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"

export const authConfig: NextAuthConfig = {
  providers: [
    Credentials({
      credentials: { password: { label: "Password", type: "password" } },
      async authorize(c) {
        if (c.password !== "password") return null
        return { 
          id: "1",
          name: "John Doe",
          email: "",
          role: "USER",
          image: "",
          storeId: "",
          emailVerified: true
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      profile(profile) {
        return { 
          id: profile.sub, 
          name: profile.name, 
          email: profile.email, 
          role: profile.role ?? "USER", 
          image: profile.picture,
          storeId: profile.storeId ?? "",
          emailVerified: profile.email_verified
        }
      }
    })
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    authorized({auth}) {
      return !!auth?.user
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.storeId = user.storeId
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN"|"USER"|"VENDOR"
        session.user.storeId = token.storeId as string
      }
      return session
    },
  },
}

export const providerMap = authConfig.providers
  .map((provider) => {
    if (typeof provider === "function") {
      const providerData = provider()
      return { id: providerData.id, name: providerData.name }
    } else {
      return { id: provider.id, name: provider.name }
    }
  })
  .filter((provider) => provider.id !== "credentials")

export default authConfig