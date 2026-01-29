import { NextResponse } from "next/server"
import { sendContactEmail } from "@/lib/email/sendContactEmail"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, phone, message } = body as {
      name?: string
      email?: string
      phone?: string
      message?: string
    }

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof message !== "string"
    ) {
      return NextResponse.json(
        { ok: false, error: "Missing or invalid fields: name, email, phone, message" },
        { status: 400 }
      )
    }

    const trimmed = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      message: message.trim(),
    }

    if (!trimmed.name || !trimmed.email || !trimmed.message) {
      return NextResponse.json(
        { ok: false, error: "Name, email and message are required" },
        { status: 400 }
      )
    }

    const result = await sendContactEmail(trimmed)
    return NextResponse.json(result, { status: result.ok ? 200 : 500 })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
