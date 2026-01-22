import { Resend } from "resend"

export interface OrderEmailItem {
  productName: string
  variationName?: string | null
  quantity: number
  unitPrice: number
}

export interface SendOrderEmailInput {
  orderId: string
  customerEmail?: string | null
  customerPhone: string
  total: number
  items: OrderEmailItem[]
}

export interface SendOrderEmailResult {
  ok: boolean
  id?: string
  error?: string
}

function formatCurrencyRSD(amount: number): string {
  return `${amount.toFixed(2)} RSD`
}

function buildItemsHtml(items: OrderEmailItem[]): string {
  const rows = items
    .map((it) => {
      const name = it.variationName
        ? `${it.productName} — ${it.variationName}`
        : it.productName
      const lineRight = `${it.quantity} × ${formatCurrencyRSD(it.unitPrice)}`
      return `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee">${name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;white-space:nowrap">${lineRight}</td>
        </tr>
      `
    })
    .join("")
  return `
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;padding:8px 12px;border-bottom:2px solid #111">Proizvod</th>
          <th style="text-align:right;padding:8px 12px;border-bottom:2px solid #111">Količina × Cena</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

export async function sendOrderEmail(input: SendOrderEmailInput): Promise<SendOrderEmailResult> {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = process.env.ORDER_EMAIL_TO || "360elitelogistic@gmail.com"
  // Use a verified sender. For local/testing, Resend allows onboarding@resend.dev.
  const fromEmail = process.env.ORDER_EMAIL_FROM || "onboarding@resend.dev"

  if (!apiKey) {
    console.warn("RESEND_API_KEY is not set; skipping email send")
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }

const resend = new Resend(apiKey)

  const subject = `Nova porudžbina #${input.orderId}`

  const itemsHtml = buildItemsHtml(input.items)

  // Derive subtotal and PDV from total (total is WITH VAT snapshot)
  const subtotal = input.total / 1.2
  const pdv = input.total - subtotal
  const totalHtml = `
    <div style="margin:12px 0 0 0;font-size:16px">
      <p style="margin:4px 0"><strong>Međuzbir:</strong> ${formatCurrencyRSD(subtotal)}</p>
      <p style="margin:4px 0"><strong>PDV 20%:</strong> ${formatCurrencyRSD(pdv)}</p>
      <p style="margin:8px 0 0 0"><strong>Ukupno:</strong> ${formatCurrencyRSD(input.total)}</p>
    </div>
  `

  const headerHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;font-size:14px">
      <h2 style="margin:0 0 12px 0">Nova porudžbina #${input.orderId}</h2>
      <p style="margin:0 0 8px 0"><strong>Telefon kupca:</strong> ${input.customerPhone}</p>
      ${input.customerEmail ? `<p style="margin:0 0 8px 0"><strong>Email kupca:</strong> ${input.customerEmail}</p>` : ""}
    </div>
  `

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;font-size:14px;line-height:1.5">
      ${headerHtml}
      <div style="margin:16px 0">${itemsHtml}</div>
      ${totalHtml}
    </div>
  `
  try {
    const recipients: string[] = [toEmail]
    if (process.env.ORDER_EMAIL_CC_CUSTOMER === "true" && input.customerEmail) {
      recipients.push(input.customerEmail)
    }
    const response = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
    })
    return { ok: true, id: (response as any)?.id }
  } catch (e: any) {
    console.error("sendOrderEmail failed:", e?.message || e)
    return { ok: false, error: e?.message ?? "Unknown error" }
  }
}


