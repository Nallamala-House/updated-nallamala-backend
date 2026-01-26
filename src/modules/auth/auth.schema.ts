import { z } from "zod"

const email = z
  .string()
  .trim()
  .toLowerCase()
  .email("Invalid email format")
  .max(255, "Email too long")

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password too long") // bcrypt limit
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[a-z]/, "Must contain a lowercase letter")
  .regex(/[0-9]/, "Must contain a number")

export const signupSchema = z.object({
  email,
  password
})

export const signinSchema = z.object({
  email,
  password
})

// Middleware validator
export const validate = (type: "signup" | "signin") => {
  const schema = type === "signup" ? signupSchema : signinSchema

  return (req: any, res: any, next: any) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (err: any) {
      return res.status(400).json({
        error: "Invalid request",
        details: err.errors?.map((e: any) => e.message)
      })
    }
  }
}