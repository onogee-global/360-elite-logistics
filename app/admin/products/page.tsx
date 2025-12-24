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
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import {
  createProduct,
  deleteProduct,
  fetchCategoriesAdmin,
  fetchProductsAdmin,
  updateProduct,
  fetchProductVariationsAdmin,
  createProductVariation,
  updateProductVariation,
  deleteProductVariation,
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [variations, setVariations] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 20;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const [prods, cats] = await Promise.all([
          fetchProductsAdmin(),
          fetchCategoriesAdmin(),
        ]);
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
      return (
        product.name.toLowerCase().includes(q) ||
        categoryName.toLowerCase().includes(q)
      );
    });
  }, [items, categories, searchQuery]);

  // Pagination derived values
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);
  const total = filteredProducts.length;
  const pageCount = Math.max(1, Math.ceil(total / 20));
  const startIndex = Math.max(0, (page - 1) * 20);
  const endIndex = Math.min(startIndex + 20, total);
  useEffect(() => {
    if (startIndex >= total && total > 0) {
      setPage(Math.max(1, Math.ceil(total / 20)));
    }
  }, [total, startIndex]);
  const pageItems = useMemo(
    () => filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );

  const startCreate = () => {
    setEditing({
      name: "",
      nameEn: "",
      description: "",
      descriptionEn: "",
      image: "",
      categoryId: "",
      // subcategory removed
      price: undefined,
      discount: undefined,
    });
    setVariations([]);
    setOpen(true);
  };

  const startEdit = (product: any) => {
    (async () => {
      setEditing({ ...product });
      try {
        const vars = await fetchProductVariationsAdmin(product.id);
        setVariations(vars);
      } catch (e) {
        console.error(e);
        setVariations([]);
      } finally {
        setOpen(true);
      }
    })();
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
      // Validate variations only if provided
      const activeVariations = variations.filter((v) => !v._deleted);
      for (const v of activeVariations) {
        if (!v.name || !v.nameEn) {
          toast({
            title: "Nedostaje naziv varijacije",
            description: "Popunite nazive varijacije na srpskom i engleskom.",
            variant: "destructive",
          });
          return;
        }
        if (
          !(typeof v.price === "number") ||
          Number.isNaN(v.price) ||
          v.price <= 0
        ) {
          toast({
            title: "Neispravna cena",
            description: "Cena varijacije mora biti veća od nule.",
            variant: "destructive",
          });
          return;
        }
        if (!v.imageUrl) {
          toast({
            title: "Nedostaje slika varijacije",
            description: "Svaka varijacija mora imati svoju sliku.",
            variant: "destructive",
          });
          return;
        }
      }
      if (editing.id) {
        await updateProduct({
          id: editing.id,
          name: editing.name,
          nameEn: editing.nameEn,
          description: editing.description,
          descriptionEn: editing.descriptionEn,
          image: editing.image,
          categoryId: editing.categoryId,
          price: editing.price,
          discount: editing.discount ?? null,
        });
        setItems((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...editing } : p))
        );
        // Sync variations
        for (const v of variations) {
          if (v._deleted && v.id) {
            await deleteProductVariation(v.id);
            continue;
          }
          const payload: any = {
            productId: editing.id,
            name: v.name,
            nameEn: v.nameEn,
            price: Number(v.price),
            imageUrl: v.imageUrl,
            description: v.description ?? undefined,
            descriptionEn: v.descriptionEn ?? undefined,
            discount: typeof v.discount === "number" ? v.discount : undefined,
          };
          if (typeof v.isActive !== "undefined") {
            payload.isActive = !!v.isActive;
          }
          if (v.id) {
            await updateProductVariation({ id: v.id, ...payload });
          } else if (!v._deleted) {
            const newId = await createProductVariation(payload);
            v.id = newId;
          }
        }
        toast({ title: "Sačuvano", description: "Proizvod je izmenjen." });
      } else {
        const id = await createProduct({
          name: editing.name,
          nameEn: editing.nameEn,
          description: editing.description,
          descriptionEn: editing.descriptionEn,
          image: editing.image,
          categoryId: editing.categoryId,
          price: editing.price,
          discount: editing.discount ?? null,
        });
        setItems((prev) => [{ id, ...editing }, ...prev]);
        // Create variations for new product
        for (const v of variations) {
          if (v._deleted) continue;
          const payload: any = {
            productId: id,
            name: v.name,
            nameEn: v.nameEn,
            price: Number(v.price),
            imageUrl: v.imageUrl,
            description: v.description ?? undefined,
            descriptionEn: v.descriptionEn ?? undefined,
            discount: typeof v.discount === "number" ? v.discount : undefined,
          };
          if (typeof v.isActive !== "undefined") {
            payload.isActive = !!v.isActive;
          }
          const newId = await createProductVariation(payload);
          v.id = newId;
        }
        toast({ title: "Kreirano", description: "Proizvod je kreiran." });
      }
      setOpen(false);
      setEditing(null);
      setVariations([]);
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
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span className="text-xs md:text-sm">Učitavanje…</span>
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground">
                {total === 0
                  ? "Nema rezultata"
                  : `Prikazano ${
                      startIndex + 1
                    }–${endIndex} od ${total} proizvoda`}
              </p>
            )}
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
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((product) => {
                  const category = categories.find(
                    (c) => c.id === product.categoryId
                  );
                  const categoryDisplay = category?.name || "N/A";
                  const basePrice =
                    product.variations && product.variations.length > 0
                      ? Math.min(...product.variations.map((v: any) => v.price))
                      : product.price ?? 0;
                  const discountPct = product.discount ?? 0;
                  const hasDiscount = discountPct > 0;
                  const finalPrice = hasDiscount
                    ? basePrice * (1 - discountPct / 100)
                    : basePrice;

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
        {!loading && (
          <div className="pb-4 px-4">
            <div className="flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                  />
                  <li className="px-2 text-sm text-muted-foreground self-center">
                    Strana {page} / {Math.max(1, pageCount)}
                  </li>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pageCount, p + 1));
                    }}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        )}
      </Card>

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="w-[80vw] !w-[80vw] max-w-none sm:max-w-none h-[60vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Izmeni proizvod" : "Novi proizvod"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Naziv (SR)</Label>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) =>
                    setEditing((prev: any) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="npr. Coca Cola 1.5L"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Naziv (EN)</Label>
                <Input
                  value={editing?.nameEn ?? ""}
                  onChange={(e) =>
                    setEditing((prev: any) => ({
                      ...prev,
                      nameEn: e.target.value,
                    }))
                  }
                  placeholder="e.g. Coca Cola 1.5L"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Opis (SR)</Label>
                <Textarea
                  value={editing?.description ?? ""}
                  onChange={(e) =>
                    setEditing((prev: any) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Opis proizvoda"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Opis (EN)</Label>
                <Textarea
                  value={editing?.descriptionEn ?? ""}
                  onChange={(e) =>
                    setEditing((prev: any) => ({
                      ...prev,
                      descriptionEn: e.target.value,
                    }))
                  }
                  placeholder="Product description"
                />
              </div>
            </div>
            <div className="space-y-3">
              <ImageDropzone
                folder="products"
                value={editing?.image}
                onChange={(url) =>
                  setEditing((prev: any) => ({ ...prev, image: url }))
                }
                label="Slika proizvoda (prevuci & pusti)"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Kategorija</Label>
                  <Select
                    value={editing?.categoryId ?? ""}
                    onValueChange={(val) =>
                      setEditing((prev: any) => ({ ...prev, categoryId: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Odaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Osnovna cena</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    value={editing?.price ?? ""}
                    onChange={(e) =>
                      setEditing((prev: any) => ({
                        ...prev,
                        price: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="npr. 100.00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Popust (%)</Label>
                  <Input
                    type="number"
                    min={0}
                    max={90}
                    value={editing?.discount ?? ""}
                    onChange={(e) =>
                      setEditing((prev: any) => ({
                        ...prev,
                        discount: e.target.value
                          ? Number(e.target.value)
                          : undefined,
                      }))
                    }
                    placeholder="npr. 10"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Napomena: Cena i slika za naplatu definišu se na varijacijama
                proizvoda (tipovima). Ovde je slika samo kao fallback.
              </p>
            </div>
          </div>
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Varijacije (tipovi)</h3>
              <Button
                variant="outline"
                onClick={() =>
                  setVariations((prev) => [
                    ...prev,
                    {
                      id: undefined,
                      name: "",
                      nameEn: "",
                      price: 0,
                      imageUrl: "",
                      description: "",
                      descriptionEn: "",
                      discount: undefined,
                      _isNew: true,
                    },
                  ])
                }
              >
                + Dodaj varijaciju
              </Button>
            </div>
            <div className="space-y-4">
              {variations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Još nema varijacija. Dodajte bar jednu aktivnu varijaciju sa
                  cenom i slikom.
                </p>
              )}
              {variations.map((v, idx) => (
                <Card key={v.id ?? `new-${idx}`}>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Naziv (SR)</Label>
                        <Input
                          value={v.name}
                          placeholder="npr. Paprika / 1L / Crvena"
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx ? { ...pv, name: val } : pv
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Naziv (EN)</Label>
                        <Input
                          value={v.nameEn}
                          placeholder="e.g. Paprika / 1L / Red"
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx ? { ...pv, nameEn: val } : pv
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Opis varijacije (SR)</Label>
                        <Textarea
                          value={v.description ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx ? { ...pv, description: val } : pv
                              )
                            );
                          }}
                          placeholder="Kratak opis ukusa, boje ili veličine"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Opis varijacije (EN)</Label>
                        <Textarea
                          value={v.descriptionEn ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx ? { ...pv, descriptionEn: val } : pv
                              )
                            );
                          }}
                          placeholder="Short description of flavor, color or size"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <Label>Cena (RSD)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={v.price}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx ? { ...pv, price: Number(val) } : pv
                              )
                            );
                          }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Popust varijacije (%)</Label>
                        <Input
                          type="number"
                          min={0}
                          max={90}
                          value={v.discount ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setVariations((prev) =>
                              prev.map((pv, i) =>
                                i === idx
                                  ? {
                                      ...pv,
                                      discount: val ? Number(val) : undefined,
                                    }
                                  : pv
                              )
                            );
                          }}
                          placeholder="npr. 5"
                        />
                      </div>
                    </div>
                    <ImageDropzone
                      folder="products"
                      value={v.imageUrl}
                      onChange={(url) =>
                        setVariations((prev) =>
                          prev.map((pv, i) =>
                            i === idx ? { ...pv, imageUrl: url } : pv
                          )
                        )
                      }
                      label="Slika varijacije (obavezno)"
                    />
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => {
                          setVariations((prev) =>
                            prev
                              .map((pv, i) =>
                                i === idx ? { ...pv, _deleted: true } : pv
                              )
                              .filter((x) => !x._deleted || x.id)
                          );
                        }}
                      >
                        Ukloni varijaciju
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">Otkaži</Button>
            </DialogClose>
            <Button onClick={onSubmit}>
              {editing?.id ? "Sačuvaj" : "Kreiraj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
