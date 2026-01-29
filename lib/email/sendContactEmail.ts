import { Resend } from "resend"

export interface SendContactEmailInput {
  name: string
  email: string
  phone: string
  message: string
}

export interface SendContactEmailResult {
  ok: boolean
  id?: string
  error?: string
}

export async function sendContactEmail(
  input: SendContactEmailInput
): Promise<SendContactEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.ORDER_EMAIL_TO || process.env.CONTACT_EMAIL_TO || "360elitelogistic@gmail.com"
  const fromEmail = process.env.ORDER_EMAIL_FROM || "onboarding@resend.dev"

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; skipping contact email")
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

  function escapeHtml(s: string): string {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
  }

  const resend = new Resend(apiKey)
  const subject = `Contact form: ${input.name}`

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;font-size:14px;line-height:1.5">
      <h2 style="margin:0 0 16px 0">New message from contact form</h2>
      <p style="margin:0 0 8px 0"><strong>Name:</strong> ${escapeHtml(input.name)}</p>
      <p style="margin:0 0 8px 0"><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p style="margin:0 0 8px 0"><strong>Phone:</strong> ${escapeHtml(input.phone)}</p>
      <p style="margin:16px 0 0 0"><strong>Message:</strong></p>
      <p style="margin:8px 0 0 0;white-space:pre-wrap">${escapeHtml(input.message)}</p>
    </div>
  `

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: toEmail,
      replyTo: input.email,
      subject,
      html,
    })
    return { ok: true, id: (response as { id?: string })?.id }
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    console.error("sendContactEmail failed:", message)
    return { ok: false, error: message }
  }
}
