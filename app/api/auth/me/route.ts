import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const authToken = request.cookies.get("auth-token")?.value

    if (!authToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const user = JSON.parse(authToken)

    // Check if token is expired (7 days)
    const tokenAge = Date.now() - user.loginTime
    const maxAge = 60 * 60 * 24 * 7 * 1000 // 7 days in milliseconds

    if (tokenAge > maxAge) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        nome: user.nome,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }
}
