import { NextResponse } from "next/server"
import { sendOrderEmail, type OrderEmailItem } from "@/lib/email/sendOrderEmail"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    // Accepts both our strict shape and a lenient one with 'name' fields
    const {
      orderId,
      customerEmail,
      customerPhone,
      total,
      items,
    }: {
      orderId: string
      customerEmail?: string | null
      customerPhone: string
      total: number
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
      customerEmail: customerEmail ?? null,
      customerPhone,
      total: Number(total),
      items: normalizedItems,
    })
    return NextResponse.json(result, { status: result.ok ? 200 : 500 })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Unknown error" }, { status: 500 })
  }
}


