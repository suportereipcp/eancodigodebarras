import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if admin user already exists
    const { data: existingUser } = await supabase.from("eancodigodebarras_users").select("username").eq("username", "admin").single()

    if (existingUser) {
      return NextResponse.json({ message: "Admin user already exists" })
    }

    // Create admin user
    const { data, error } = await supabase
      .from("eancodigodebarras_users")
      .insert([
        {
          username: "admin",
          password: "admin2025",
        },
      ])
      .select()

    if (error) {
      console.error("Error creating admin user:", error)
      return NextResponse.json({ error: "Failed to create admin user" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      credentials: {
        username: "admin",
        password: "admin2025",
      },
    })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
