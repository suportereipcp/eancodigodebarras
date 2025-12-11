import { type NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if users table exists and get all users
    const { data: users, error } = await supabase.from("users").select("*")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      users: users || [],
      count: users?.length || 0,
      message: "Users retrieved successfully",
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Create admin user
    const { data, error } = await supabase
      .from("users")
      .upsert({
        username: "admin",
        password: "admin2025",
      })
      .select()

    if (error) {
      console.error("Error creating admin user:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      message: "Admin user created successfully",
      user: data,
    })
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
