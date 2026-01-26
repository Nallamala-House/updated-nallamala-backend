import { Request, Response } from "express"
import * as authService from "./auth.service"
import { issueTokens } from "../../utils/jwt"
import { env } from "../../config/env"
import { prisma } from "../../config/prisma"

const ACCESS_COOKIE = "accessToken"
const REFRESH_COOKIE = "refreshToken"

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const
}

function setAuthCookies(res: Response, access: string, refresh: string) {
  res.cookie(ACCESS_COOKIE, access, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000
  })

  res.cookie(REFRESH_COOKIE, refresh, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/api/auth/refresh"
  })
}

export async function signup(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const user = await authService.signup(email, password)
    const { accessToken, refreshToken } = issueTokens(user.id)

    setAuthCookies(res, accessToken, refreshToken)

    return res.status(201).json({ id: user.id, email: user.email })
  } catch {
    return res.status(400).json({ error: "Unable to create account" })
  }
}

export async function signin(req: Request, res: Response) {
  try {
    const { email, password } = req.body

    const user = await authService.signin(email, password)
    const { accessToken, refreshToken } = issueTokens(user.id)

    setAuthCookies(res, accessToken, refreshToken)

    return res.status(200).json({ id: user.id, email: user.email })
  } catch {
    return res.status(401).json({ error: "Invalid email or password" })
  }
}

export function logout(_: Request, res: Response) {
  res.clearCookie(ACCESS_COOKIE)
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth/refresh" })

  return res.status(200).json({ message: "Logged out successfully" })
}

// // Google OAuth callback
export async function googleCallback(req: any, res: Response) {
  try {
    const user = req.user;
    if (!user) return res.redirect(`${env.FRONTEND_URL}/signin`);

    const { accessToken, refreshToken } = issueTokens(user.id);
    setAuthCookies(res, accessToken, refreshToken);

    return res.redirect(`${env.FRONTEND_URL}/`);
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.redirect(`${env.FRONTEND_URL}/signin?error=auth_failed`);
  }
}

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: {
      id: true,
      name: true,
      email: true
    }
  })

  res.json(user)
}
