import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"

import authRoutes from "./modules/auth/auth.routes"
import { env } from "./config/env"
import passport from "passport"
import "./utils/google"


const app = express()

// Trust reverse proxy (Docker / Nginx / Render / Railway)
app.set("trust proxy", 1)

// Security headers
app.use(helmet())

// JSON body limit (prevents abuse)
app.use(express.json({ limit: "10kb" }))

// Cookies
app.use(cookieParser())

//authentication
app.use(passport.initialize())

// CORS
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true
  })
)

// Health check
app.get("/health", (_, res) => {
  res.json({ status: "ok" })
})

// Routes
app.use("/auth", authRoutes)

export default app
