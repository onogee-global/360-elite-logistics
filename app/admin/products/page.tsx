"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { products, categories } from "@/lib/mock-data";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const filteredProducts = products.filter((product) => {
    const category = categories.find((c) => c.id === product.categoryId);
    const categoryName = category?.name || "";
    const subcategory = category?.subcategories?.find(
      (s) => s.id === product.subcategoryId
    );
    const subcategoryName = subcategory?.name || "";

    return (
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subcategoryName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleDelete = (productId: string, productName: string) => {
    toast({
      title: "Proizvod obrisan",
      description: `${productName} je uspešno obrisan`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Proizvodi</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Upravljajte proizvodima u vašoj prodavnici
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Dodaj proizvod
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pretraži proizvode..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              Prikazano {filteredProducts.length} od {products.length} proizvoda
            </p>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] md:w-[80px]">Slika</TableHead>
                  <TableHead className="min-w-[150px]">Naziv</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Kategorija
                  </TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Pakovanje
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">Status</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const category = categories.find(
                    (c) => c.id === product.categoryId
                  );
                  const subcategory = category?.subcategories?.find(
                    (s) => s.id === product.subcategoryId
                  );
                  const categoryDisplay =
                    subcategory?.name || category?.name || "N/A";
                  const basePrice =
                    product.variations && product.variations.length > 0
                      ? Math.min(...product.variations.map((v: any) => v.price))
                      : product.price ?? 0;
                  const discountPct = product.discount ?? 0;
                  const hasDiscount = discountPct > 0;
                  const finalPrice = hasDiscount
                    ? basePrice * (1 - discountPct / 100)
                    : basePrice;
                  const unitDisplay =
                    product.variations && product.variations.length > 0
                      ? (product.variations[0] as any).unit ?? ""
                      : product.unit ?? "";

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-10 w-10 md:h-12 md:w-12">
                          <Image
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-sm md:text-base">
                        {product.name}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell capitalize text-sm">
                        {categoryDisplay}
                      </TableCell>
                      <TableCell>
                        {hasDiscount ? (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <span className="font-semibold text-sm md:text-base">
                              {finalPrice.toFixed(2)} RSD
                            </span>
                            <span className="text-xs text-muted-foreground line-through">
                              {basePrice.toFixed(2)} RSD
                            </span>
                          </div>
                        ) : (
                          <span className="font-semibold text-sm md:text-base">
                            {finalPrice.toFixed(2)} RSD
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {unitDisplay}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {product.inStock ? (
                          <Badge
                            variant="outline"
                            className="bg-primary/10 text-primary border-primary/20 text-xs"
                          >
                            Na stanju
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-destructive/10 text-destructive border-destructive/20 text-xs"
                          >
                            Nema na stanju
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Edit className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleDelete(product.id, product.name)
                            }
                            className="text-destructive hover:text-destructive h-8 w-8"
                          >
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
