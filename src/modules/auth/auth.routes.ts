import { Router } from "express"
import passport from "passport"
import * as authController from "./auth.controller"
import { validate } from "./auth.schema"
import { authLimiter } from "../../middlewares/rateLimiter"
import { requireAuth } from "../../middlewares/auth.middleware"
import { getMe } from "./auth.controller"

const router = Router()

// Email/password
router.post(
  "/signup",
  authLimiter,
  validate("signup"),
  authController.signup
)

router.post(
  "/signin",
  authLimiter,
  validate("signin"),
  authController.signin
)

router.post(
  "/logout",
  requireAuth,
  authController.logout
)

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
    session: false
  })
)

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "http://localhost:3000/signin",
  }),
  authController.googleCallback
)

router.get("/me", requireAuth, getMe)


export default router
