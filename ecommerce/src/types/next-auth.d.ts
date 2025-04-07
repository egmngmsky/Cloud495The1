import NextAuth from "next-auth"

declare module "next-auth" {
  /**
   * Extending the built-in session types
   */
  interface Session {
    user: {
      id: string
      name: string
      email: string
      username: string
      role: string
    }
  }

  /**
   * Extending the built-in user types
   */
  interface User {
    id: string
    name: string
    email: string
    username: string
    role: string
  }
}

declare module "next-auth/jwt" {
  /**
   * Extending the built-in JWT token types
   */
  interface JWT {
    id: string
    name: string
    email: string
    username: string
    role: string
  }
} 