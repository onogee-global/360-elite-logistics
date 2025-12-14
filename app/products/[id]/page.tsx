import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { fetchProductById } from "@/lib/supabase";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  // Category is optional in detail UI; fetch when needed
  return <ProductDetail product={product} />;
}

export async function generateStaticParams() {
  // Fallback to no pre-rendered paths; rely on runtime fetch
  return [];
}
