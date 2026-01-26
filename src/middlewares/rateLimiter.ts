import rateLimit from "express-rate-limit"

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many authentication attempts. Try again later."
  }
})