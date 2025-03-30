// custom-quiz-app\lib\auth.js
// what should I place here

import GoogleProvider from "next-auth/providers/google";
import dbConnect from "./dbConnect"; // Your Mongoose connection utility
import User from "@/models/user"; // Corrected import path casing

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials in .env.local");
}
if (!process.env.NEXTAUTH_SECRET) {
   console.warn("Missing NEXTAUTH_SECRET in .env.local. Using a generated value.");
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },

  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev',

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (!profile?.email) {
        console.error("No email provided by Google");
        return false;
      }

      try {
        await dbConnect();
        console.log("SignIn: Checking for existing user with email:", profile.email);
        
        let dbUser = await User.findOne({ email: profile.email });
        
        if (!dbUser) {
          console.log("SignIn: Creating new user for email:", profile.email);
          dbUser = await User.create({
            email: profile.email,
            name: profile.name,
            image: profile.picture,
          });
          console.log("SignIn: Created new user with ID:", dbUser._id);
        } else {
          console.log("SignIn: Found existing user:", dbUser._id);
          // Update user info if needed
          if (dbUser.name !== profile.name || dbUser.image !== profile.picture) {
            dbUser.name = profile.name;
            dbUser.image = profile.picture;
            await dbUser.save();
            console.log("SignIn: Updated user details for ID:", dbUser._id);
          }
        }
        
        // Add the database ID to the profile for use in the jwt callback
        user.id = dbUser._id.toString();
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },

    async jwt({ token, user, account, profile, trigger }) {
      try {
        // If this is the first sign in, user object will be available
        if (user) {
          console.log("JWT: First sign in, setting token from user object");
          token.id = user.id;
          token.email = user.email;
          return token;
        }

        // On subsequent calls, verify the user still exists
        await dbConnect();
        console.log("JWT: Verifying user exists for email:", token.email);
        const dbUser = await User.findOne({ email: token.email });
        
        if (dbUser) {
          console.log("JWT: Found user, ID:", dbUser._id);
          token.id = dbUser._id.toString();
        } else {
          console.error("JWT: User not found for email:", token.email);
          // You might want to force a sign out here
          return null;
        }
        
        return token;
      } catch (error) {
        console.error("Error in jwt callback:", error);
        return token;
      }
    },

    async session({ session, token }) {
      if (token?.id) {
        console.log("Session: Setting user ID:", token.id);
        session.user.id = token.id;
      }
      return session;
    },
  },
  // Add other options if needed
};