import jwt, { JwtPayload } from "jsonwebtoken"
import { env } from "../config/env"

const ACCESS_EXPIRES = "15m"
const REFRESH_EXPIRES = "7d"
const ISSUER = "nallamala-api"
const AUDIENCE = "nallamala-web"

export type TokenPayload = JwtPayload & {
  sub: string // user id
  type: "access" | "refresh"
}

export function issueTokens(userId: string) {
  const basePayload = {
    sub: userId,
    iss: ISSUER,
    aud: AUDIENCE
  }

  const accessToken = jwt.sign(
    { ...basePayload, type: "access" },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRES }
  )

  const refreshToken = jwt.sign(
    { ...basePayload, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES }
  )

  return { accessToken, refreshToken }
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE
    }) as TokenPayload
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE
    }) as TokenPayload
  } catch {
    return null
  }
}