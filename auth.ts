
import NextAuth from "next-auth"
import { FirestoreAdapter } from "@auth/firebase-adapter"
import Google from "next-auth/providers/google"
import { cert } from "firebase-admin/app"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({ clientId: '288775417657-bj6trm0kuqodbqjbu8lmeuvcnchoanpt.apps.googleusercontent.com', clientSecret: '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' }),
  ],
  adapter: FirestoreAdapter({
    credential: cert({
      projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
      clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY,
    }),
  })
})