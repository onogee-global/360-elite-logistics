import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/product-detail";
import { fetchProductById, fetchCategoryById } from "@/lib/supabase";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await fetchProductById(id);

  if (!product) {
    notFound();
  }

  const category = product.categoryId
    ? await fetchCategoryById(product.categoryId)
    : null;
  return <ProductDetail product={product} category={category ?? undefined} />;
}

export async function generateStaticParams() {
  // Fallback to no pre-rendered paths; rely on runtime fetch
  return [];
}
