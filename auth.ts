import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import Google from "next-auth/providers/google"
import { cert } from "firebase-admin/app"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({ 
      clientId: process.env.AUTH_GOOGLE_ID!, 
      clientSecret: process.env.AUTH_GOOGLE_SECRET! 
    }),
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  }),
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})