import { Resend } from "resend"

export interface OrderEmailItem {
  productName: string
  variationName?: string | null
  quantity: number
  unitPrice: number
}

export interface SendOrderEmailInput {
  orderId: string
  customerName?: string | null
  customerEmail?: string | null
  customerPhone: string
  address?: string | null
  city?: string | null
  zip?: string | null
  country?: string | null
  total: number
  /** Međuzbir (pre popusta) – za prikaz u emailu */
  subtotal?: number | null
  /** Kod popusta (npr. SALE10) */
  promoCode?: string | null
  /** Iznos popusta u RSD */
  promoDiscountAmount?: number | null
  /** Iznos dostave u RSD (0 = besplatno) */
  deliveryAmount?: number | null
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
  // Resend free tier: you can only send TO your own account email until you verify a domain.
  // FROM must be onboarding@resend.dev (testing) or an address on a verified domain (resend.com/domains).
  const fromEmail = process.env.ORDER_PRODUCTS_EMAIL_FROM || "onboarding@resend.dev"

  if (!apiKey) {
    console.warn("[sendOrderEmail] RESEND_API_KEY is not set; skipping")
    return { ok: false, error: "RESEND_API_KEY not configured" }
  }
  console.log("[sendOrderEmail] Sending", { orderId: input.orderId, to: toEmail, from: fromEmail })

const resend = new Resend(apiKey)

  const subject = `Nova porudžbina #${input.orderId}`

  const itemsHtml = buildItemsHtml(input.items)

  // Prikaz cene: međuzbir, eventualno promo, osnovica za PDV, PDV, dostava, ukupno
  const subtotal = input.subtotal ?? input.total / 1.2
  const promoAmount = input.promoDiscountAmount ?? 0
  const taxable = Math.max(0, subtotal - promoAmount)
  const pdv = taxable * 0.2
  const deliveryAmount = input.deliveryAmount ?? 0
  const hasPromo = !!(input.promoCode && promoAmount > 0)

  const totalHtml = `
    <div style="margin:12px 0 0 0;font-size:16px">
      <p style="margin:4px 0"><strong>Međuzbir:</strong> ${formatCurrencyRSD(subtotal)}</p>
      ${hasPromo ? `<p style="margin:4px 0"><strong>Promo (${input.promoCode}):</strong> <span style="color:#16a34a">-${formatCurrencyRSD(promoAmount)}</span></p>` : ""}
      ${hasPromo ? `<p style="margin:4px 0"><strong>Osnovica za PDV:</strong> ${formatCurrencyRSD(taxable)}</p>` : ""}
      <p style="margin:4px 0"><strong>PDV 20%:</strong> ${formatCurrencyRSD(pdv)}</p>
      ${deliveryAmount > 0 ? `<p style="margin:4px 0"><strong>Dostava:</strong> ${formatCurrencyRSD(deliveryAmount)}</p>` : ""}
      <p style="margin:8px 0 0 0"><strong>Ukupno:</strong> ${formatCurrencyRSD(input.total)}</p>
    </div>
  `

  const addrParts = [
    input.address,
    [input.zip, input.city].filter(Boolean).join(" "),
    input.country,
  ].filter(Boolean)
  const addressLine = addrParts.length > 0 ? addrParts.join(", ") : null

  const headerHtml = `
    <div style="font-family:Arial,Helvetica,sans-serif;color:#111;font-size:14px">
      <h2 style="margin:0 0 12px 0">Nova porudžbina #${input.orderId}</h2>
      ${input.customerName ? `<p style="margin:0 0 8px 0"><strong>Kupac:</strong> ${input.customerName}</p>` : ""}
      <p style="margin:0 0 8px 0"><strong>Telefon:</strong> ${input.customerPhone}</p>
      ${input.customerEmail ? `<p style="margin:0 0 8px 0"><strong>Email:</strong> ${input.customerEmail}</p>` : ""}
      ${addressLine ? `<p style="margin:0 0 8px 0"><strong>Adresa:</strong> ${addressLine}</p>` : ""}
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
    // Resend returns { data: { id }, error } – check error and use data.id
    const response = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject,
      html,
    })
    const resendError = (response as { error?: { message?: string } })?.error
    if (resendError) {
      const msg = resendError.message ?? "Resend returned an error"
      console.error("[sendOrderEmail] Resend error:", msg, { orderId: input.orderId, to: recipients, from: fromEmail })
      return { ok: false, error: msg }
    }
    const id = (response as { data?: { id?: string } })?.data?.id
    console.log("[sendOrderEmail] Sent successfully", { orderId: input.orderId, to: recipients, from: fromEmail, resendId: id })
    return { ok: true, id: id ?? undefined }
  } catch (e: any) {
    const msg = e?.message ?? "Unknown error"
    console.error("[sendOrderEmail] Exception:", msg, { orderId: input.orderId, to: toEmail, from: fromEmail })
    return { ok: false, error: msg }
  }
}


