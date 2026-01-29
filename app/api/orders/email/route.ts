import { NextResponse } from "next/server"
import { sendOrderEmail, type OrderEmailItem } from "@/lib/email/sendOrderEmail"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Accepts both our strict shape and a lenient one with 'name' fields
    const {
      orderId,
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      zip,
      country,
      total,
      subtotal,
      promoCode,
      promoDiscountAmount,
      deliveryAmount,
      items,
    }: {
      orderId: string
      customerName?: string | null
      customerEmail?: string | null
      customerPhone: string
      address?: string | null
      city?: string | null
      zip?: string | null
      country?: string | null
      total: number
      subtotal?: number | null
      promoCode?: string | null
      promoDiscountAmount?: number | null
      deliveryAmount?: number | null
      items: Array<
        | OrderEmailItem
        | {
            name: string
            variationName?: string | null
            quantity: number
            unitPrice: number
          }
      >
    } = body

    if (!orderId || !Array.isArray(items)) {
      console.warn("[orders/email] Invalid payload:", { hasOrderId: !!orderId, itemsIsArray: Array.isArray(items) })
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 })
    }

    const normalizedItems: OrderEmailItem[] = items.map((it: any) => ({
      productName: it.productName ?? it.name,
      variationName: it.variationName ?? null,
      quantity: Number(it.quantity ?? 0),
      unitPrice: Number(it.unitPrice ?? 0),
    }))

    const result = await sendOrderEmail({
      orderId,
      customerName: customerName ?? null,
      customerEmail: customerEmail ?? null,
      customerPhone,
      address: address ?? null,
      city: city ?? null,
      zip: zip ?? null,
      country: country ?? null,
      total: Number(total),
      subtotal: subtotal != null ? Number(subtotal) : null,
      promoCode: promoCode ?? null,
      promoDiscountAmount: promoDiscountAmount != null ? Number(promoDiscountAmount) : null,
      deliveryAmount: deliveryAmount != null ? Number(deliveryAmount) : null,
      items: normalizedItems,
    })
    if (!result.ok) {
      console.error("[orders/email] sendOrderEmail failed:", result.error, { orderId })
    }
    return NextResponse.json(result, { status: result.ok ? 200 : 500 })
  } catch (e: any) {
    console.error("[orders/email] Exception:", e?.message ?? e, { stack: (e as Error)?.stack })
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}






