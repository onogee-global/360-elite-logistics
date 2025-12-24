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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  createCategory,
  deleteCategory,
  fetchCategoriesAdmin,
  updateCategory,
} from "@/lib/supabase";

interface CategoryFormValues {
  id?: string;
  name: string;
  nameEn: string;
  slug: string;
  icon?: string;
}

export default function AdminCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryFormValues | null>(null);
  const { toast } = useToast();

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q),
    );
  }, [categories, searchQuery]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchCategoriesAdmin();
        if (mounted) setCategories(data);
      } catch (e) {
        console.error(e);
        toast({
          title: "Greška",
          description: "Nije moguće učitati kategorije.",
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

  const resetForm = () => {
    setEditing({
      name: "",
      nameEn: "",
      slug: "",
      icon: "",
    });
  };

  const onCreate = async () => {
    resetForm();
    setOpen(true);
  };

  const onEdit = (cat: any) => {
    setEditing({
      id: cat.id,
      name: cat.name ?? "",
      nameEn: cat.nameEn ?? "",
      slug: cat.slug ?? "",
      icon: cat.icon ?? "",
    });
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm("Da li ste sigurni da želite da obrišete kategoriju?")) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: "Obrisano", description: "Kategorija je obrisana." });
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
        await updateCategory({
          id: editing.id,
          name: editing.name,
          nameEn: editing.nameEn,
          slug: editing.slug,
          icon: editing.icon,
        });
        setCategories((prev) =>
          prev.map((c) => (c.id === editing.id ? { ...c, ...editing } : c)),
        );
        toast({ title: "Sačuvano", description: "Kategorija je izmenjena." });
      } else {
        const id = await createCategory({
          name: editing.name,
          nameEn: editing.nameEn,
          slug: editing.slug,
          icon: editing.icon,
        });
        setCategories((prev) => [{ id, ...editing, subcategories: [] }, ...prev]);
        toast({ title: "Kreirano", description: "Kategorija je kreirana." });
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Kategorije</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Upravljajte kategorijama i podacima
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj kategoriju
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pretraži kategorije..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <p className="text-xs md:text-sm text-muted-foreground">
              {loading ? "Učitavanje..." : `Prikazano ${filtered.length} od ${categories.length} kategorija`}
            </p>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Naziv (SR)</TableHead>
                  <TableHead className="min-w-[180px]">Naziv (EN)</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="hidden sm:table-cell">Ikonica</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.nameEn}</TableCell>
                    <TableCell className="lowercase">{cat.slug}</TableCell>
                    <TableCell className="hidden sm:table-cell">{cat.icon || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onEdit(cat)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(cat.id)}
                          className="text-destructive hover:text-destructive h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setEditing(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Izmeni kategoriju" : "Nova kategorija"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Naziv (SR)</div>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...(prev as any), name: e.target.value }))}
                  placeholder="npr. Pića i hrana"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Naziv (EN)</div>
                <Input
                  value={editing?.nameEn ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...(prev as any), nameEn: e.target.value }))}
                  placeholder="e.g. Drinks & Food"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Slug</div>
                <Input
                  value={editing?.slug ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...(prev as any), slug: e.target.value.toLowerCase() }))}
                  placeholder="pica-i-hrana"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Ikonica (emoji ili naziv)</div>
                <Input
                  value={editing?.icon ?? ""}
                  onChange={(e) => setEditing((prev) => ({ ...(prev as any), icon: e.target.value }))}
                  placeholder="🍽️"
                />
              </div>
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


