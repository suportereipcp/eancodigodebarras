import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    console.log("=== LOGIN ATTEMPT ===")
    console.log("Username:", username)
    console.log("Password:", password)

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // First, let's check if the users table exists and has data
    const { data: users, error: queryError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .eq("password", password)
      .single()

    console.log("Query result:", users)
    console.log("Query error:", queryError)

    if (queryError || !users) {
      console.log("=== LOGIN FAILED - No user found ===")
      console.log("Error details:", queryError)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found:", users)

    const userData = {
      id: users.id,
      username: users.username,
      nome: users.nome, // Include nome field
      loginTime: Date.now(),
    }

    // Create response with success
    const response = NextResponse.json({
      success: true,
      user: { id: users.id, username: users.username, nome: users.nome }, // Include nome in response
    })

    response.cookies.set("auth-token", JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("=== LOGIN SUCCESSFUL ===")
    console.log("Cookie set for user:", users.username)
    console.log("Cookie value:", JSON.stringify(userData))

    return response
  } catch (error) {
    console.error("=== LOGIN ERROR ===", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
