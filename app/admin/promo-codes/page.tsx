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
import { useToast } from "@/hooks/use-toast";
import {
  createPromoCode,
  deletePromoCode,
  fetchPromoCodesAdmin,
  updatePromoCode,
} from "@/lib/supabase";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface PromoFormValues {
  id?: string;
  code: string;
  discount: number;
  active?: boolean;
}

export default function AdminPromoCodesPage() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<PromoFormValues[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PromoFormValues | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchPromoCodesAdmin();
        if (mounted) {
          setItems(
            data.map((p) => ({
              id: p.id,
              code: p.code,
              discount: p.discount,
              active: p.active ?? true,
            })),
          );
        }
      } catch (e) {
        console.error(e);
        toast({
          title: "Greška",
          description: "Nije moguće učitati promo kodove.",
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

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter((it) => it.code.toLowerCase().includes(q));
  }, [items, search]);

  const startCreate = () => {
    setEditing({
      code: "",
      discount: 0,
      active: true,
    });
    setOpen(true);
  };

  const startEdit = (it: PromoFormValues) => {
    setEditing({ ...it });
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Obrisati ovaj promo kod?")) return;
    try {
      await deletePromoCode(id);
      setItems((prev) => prev.filter((p) => p.id !== id));
      toast({ title: "Promo kod obrisan" });
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
    if (!editing.code.trim()) {
      toast({ title: "Unesite naziv promo koda", variant: "destructive" });
      return;
    }
    if (Number.isNaN(editing.discount) || editing.discount < 0 || editing.discount > 90) {
      toast({ title: "Popust mora biti 0–90", variant: "destructive" });
      return;
    }
    try {
      if (editing.id) {
        await updatePromoCode({
          id: editing.id,
          code: editing.code.trim(),
          discount: editing.discount,
          active: editing.active ?? true,
        });
        setItems((prev) =>
          prev.map((p) => (p.id === editing.id ? { ...p, ...editing } : p)),
        );
        toast({ title: "Promo kod sačuvan" });
      } else {
        const id = await createPromoCode({
          code: editing.code.trim(),
          discount: editing.discount,
          active: editing.active ?? true,
        });
        setItems((prev) => [{ id, ...editing }, ...prev]);
        toast({ title: "Promo kod kreiran" });
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
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Promo kodovi
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Upravljajte promo kodovima (naziv + popust)
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={startCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj promo kod
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pretraži promo kodove"
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span className="text-xs md:text-sm">Učitavam…</span>
              </div>
            )}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naziv (kod)</TableHead>
                  <TableHead>Popust (%)</TableHead>
                  <TableHead className="text-right">Akcije</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell className="font-medium">{it.code}</TableCell>
                    <TableCell>{it.discount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => startEdit(it)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => it.id && handleDelete(it.id)}
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

      <Dialog
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setEditing(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Izmena promo koda" : "Novi promo kod"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Naziv (kod)</div>
              <Input
                value={editing?.code ?? ""}
                onChange={(e) =>
                  setEditing((prev: any) => ({ ...prev, code: e.target.value }))
                }
                placeholder="npr. NOVA10"
              />
            </div>
            <div className="space-y-1.5">
              <div className="text-sm font-medium">Popust (%)</div>
              <Input
                type="number"
                min={0}
                max={90}
                value={editing?.discount ?? 0}
                onChange={(e) =>
                  setEditing((prev: any) => ({
                    ...prev,
                    discount: Number(e.target.value),
                  }))
                }
                placeholder="npr. 10"
              />
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


