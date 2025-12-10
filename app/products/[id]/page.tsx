import { notFound } from "next/navigation"
import { products, categories } from "@/lib/mock-data"
import { ProductDetail } from "@/components/product-detail"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  const category = categories.find((c) => c.slug === product.category)

  return <ProductDetail product={product} category={category} />
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}
