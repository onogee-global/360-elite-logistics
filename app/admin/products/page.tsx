"use client";

import { useEffect, useMemo, useState } from "react";
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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  createProduct,
  deleteProduct,
  fetchCategoriesAdmin,
  fetchProductsAdmin,
  updateProduct,
} from "@/lib/supabase";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ImageDropzone from "@/components/admin/ImageDropzone";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([fetchProductsAdmin(), fetchCategoriesAdmin()]);
        if (mounted) {
          setItems(prods);
          setCategories(cats);
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Greška",
          description: "Nije moguće učitati podatke.",
          variant: "destructive",
        });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [toast]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return items.filter((product) => {
      const category = categories.find((c) => c.id === product.categoryId);
      const categoryName = category?.name || "";
      const subcategory = category?.subcategories?.find(
        (s: any) => s.id === product.subcategoryId
      );
      const subcategoryName = subcategory?.name || "";
      return (
        product.name.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q) ||
        subcategoryName.toLowerCase().includes(q)
      );
    });
  }, [items, categories, searchQuery]);

  const startCreate = () => {
    setEditing({
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      image: "",
      categoryId: "",
      subcategoryId: "",
      discount: undefined,
    });
    setOpen(true);
  };

  const startEdit = (product: any) => {
    setEditing({ ...product });
    setOpen(true);
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Obrisati proizvod "${productName}"?`)) return;
    try {
      await deleteProduct(productId);
      setItems((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: "Proizvod obrisan",
        description: `${productName} je uspešno obrisan`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Greška",
        description: "Brisanje nije uspelo.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        await updateProduct({
          id: editing.id,
          name: editing.name,
          nameEn: editing.nameEn,
          description: editing.description,
          descriptionEn: editing.descriptionEn,
          image: editing.image,
          categoryId: editing.categoryId,
          subcategoryId: editing.subcategoryId || null,
          discount: editing.discount ?? null,
        });
        setItems((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...editing } : p)));
        toast({ title: "Sačuvano", description: "Proizvod je izmenjen." });
      } else {
        const id = await createProduct({
          name: editing.name,
          nameEn: editing.nameEn,
          description: editing.description,
          descriptionEn: editing.descriptionEn,
          image: editing.image,
          categoryId: editing.categoryId,
          subcategoryId: editing.subcategoryId || null,
          discount: editing.discount ?? null,
        });
        setItems((prev) => [{ id, ...editing }, ...prev]);
        toast({ title: "Kreirano", description: "Proizvod je kreiran." });
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast({
        title: "Greška",
        description: "Čuvanje nije uspelo.",
        variant: "destructive",
      });
    }
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
        <Button className="w-full sm:w-auto" onClick={startCreate}>
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
              {loading ? "Učitavanje..." : `Prikazano ${filteredProducts.length} od ${items.length} proizvoda`}
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
                    (s: any) => s.id === product.subcategoryId
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
                            onClick={() => startEdit(product)}
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

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Izmeni proizvod" : "Novi proizvod"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Naziv (SR)</Label>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) => setEditing((prev: any) => ({ ...prev, name: e.target.value }))}
                  placeholder="npr. Coca Cola 1.5L"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Naziv (EN)</Label>
                <Input
                  value={editing?.nameEn ?? ""}
                  onChange={(e) => setEditing((prev: any) => ({ ...prev, nameEn: e.target.value }))}
                  placeholder="e.g. Coca Cola 1.5L"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Opis (SR)</Label>
                <Input
                  value={editing?.description ?? ""}
                  onChange={(e) => setEditing((prev: any) => ({ ...prev, description: e.target.value }))}
                  placeholder="Opis proizvoda"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Opis (EN)</Label>
                <Input
                  value={editing?.descriptionEn ?? ""}
                  onChange={(e) => setEditing((prev: any) => ({ ...prev, descriptionEn: e.target.value }))}
                  placeholder="Product description"
                />
              </div>
            </div>
            <div className="space-y-3">
              <ImageDropzone
                folder="products"
                value={editing?.image}
                onChange={(url) => setEditing((prev: any) => ({ ...prev, image: url }))}
                label="Slika proizvoda (prevuci & pusti)"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Kategorija</Label>
                  <Select
                    value={editing?.categoryId ?? ""}
                    onValueChange={(val) => setEditing((prev: any) => ({ ...prev, categoryId: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Odaberite" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Potkategorija</Label>
                  <Select
                    value={editing?.subcategoryId ?? ""}
                    onValueChange={(val) => setEditing((prev: any) => ({ ...prev, subcategoryId: val }))}
                  >
                    <SelectTrigger><SelectValue placeholder="(opciono)" /></SelectTrigger>
                    <SelectContent>
                      {(categories.find((c) => c.id === editing?.categoryId)?.subcategories ?? []).map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Popust (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={editing?.discount ?? ""}
                    onChange={(e) => setEditing((prev: any) => ({ ...prev, discount: e.target.value ? Number(e.target.value) : undefined }))}
                    placeholder="npr. 10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Napomena: Cena i slika za naplatu definišu se na varijacijama proizvoda (tipovima). Ovde je slika samo kao fallback.
              </p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Otkaži</Button>
            </DialogClose>
            <Button onClick={onSubmit}>{editing?.id ? "Sačuvaj" : "Kreiraj"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
