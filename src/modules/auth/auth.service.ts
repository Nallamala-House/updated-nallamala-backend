import bcrypt from "bcrypt"
import { prisma } from "../../config/prisma"

export async function signup(email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } })

  if (existing) {
    throw new Error("User exists")
  }

  const hashed = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed
    }
  })

  return user
}

export async function signin(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    throw new Error("Invalid credentials")
  }

  const valid = await bcrypt.compare(password, user.password)

  if (!valid) {
    throw new Error("Invalid credentials")
  }

  return user
}
