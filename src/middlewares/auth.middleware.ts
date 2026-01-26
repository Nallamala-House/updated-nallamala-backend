import { Request, Response, NextFunction } from "express"
import { verifyAccessToken } from "../utils/jwt"

// Extend Express Request globally
declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  const payload = verifyAccessToken(token)

  if (!payload || !payload.sub) {
    return res.status(401).json({ message: "Invalid token" })
  }

  // THIS IS THE KEY LINE
  req.userId = payload.sub

  next()
}
