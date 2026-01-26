import passport from "passport"
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20"
import { prisma } from "../config/prisma"

// Load env vars safely
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
} = process.env

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  throw new Error("Missing Google OAuth environment variables")
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done
    ) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase()

        // Optional: restrict domain
        // if (!email?.endsWith("@study.iitm.ac.in")) {
        //   return done(null, false)
        // }

        if (!email) {
          return done(null, false)
        }

        let user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              provider: "google",
            },
          })
        }

        return done(null, user)
      } catch (err) {
        return done(err as Error, false)
      }
    }
  )
)

export default passport
