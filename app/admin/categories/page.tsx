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
import { Spinner } from "@/components/ui/spinner";
import {
  Pagination,
  PaginationContent,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useLocale } from "@/lib/locale-context";

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
  const { t } = useLocale();
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
    );
  }, [categories, searchQuery]);

  // Pagination derived values
  useEffect(() => {
    setPage(0);
  }, [searchQuery, categories.length]);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = Math.max(0, page * pageSize);
  const endIndex = Math.min(startIndex + pageSize, total);
  useEffect(() => {
    if (startIndex >= total && total > 0) {
      setPage(Math.max(0, Math.ceil(total / pageSize) - 1));
    }
  }, [total, startIndex, pageSize]);
  const pageItems = useMemo(
    () => filtered.slice(startIndex, endIndex),
    [filtered, startIndex, endIndex]
  );

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
          title: t("toast.error"),
          description: t("toast.loadFailed"),
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
    if (!confirm(t("admin.category.deleteConfirm"))) return;
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      toast({ title: t("toast.categoryDeleted") });
    } catch (e) {
      console.error(e);
      toast({
        title: t("toast.error"),
        description: t("toast.deleteFailed"),
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
          prev.map((c) => (c.id === editing.id ? { ...c, ...editing } : c))
        );
        toast({ title: t("toast.categorySaved") });
      } else {
        const id = await createCategory({
          name: editing.name,
          nameEn: editing.nameEn,
          slug: editing.slug,
          icon: editing.icon,
        });
        setCategories((prev) => [
          { id, ...editing, subcategories: [] },
          ...prev,
        ]);
        toast({ title: t("toast.categoryCreated") });
      }
      setOpen(false);
      setEditing(null);
    } catch (e) {
      console.error(e);
      toast({
        title: t("toast.error"),
        description: t("toast.saveFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            {t("admin.categories.title")}
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {t("admin.categories.subtitle")}
          </p>
        </div>
        <Button className="w-full sm:w-auto" onClick={onCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t("admin.categories.add")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative w-full sm:flex-1 sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t("admin.searchCategories")}
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Spinner className="h-4 w-4" />
                <span className="text-xs md:text-sm">{t("loading")}</span>
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground">
                {total === 0
                  ? t("admin.list.noResults")
                  : `${t("admin.list.shown")} ${
                      startIndex + 1
                    }\u2013${endIndex} ${t("admin.list.of")} ${total} ${t(
                      "categories"
                    )}`}
              </p>
            )}
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">
                    {t("field.nameSr")}
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    {t("field.nameEn")}
                  </TableHead>
                  <TableHead>{t("field.slug")}</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("field.icon")}
                  </TableHead>
                  <TableHead className="text-right">{t("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageItems.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>{cat.nameEn}</TableCell>
                    <TableCell className="lowercase">{cat.slug}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {cat.icon || "-"}
                    </TableCell>
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
          {!loading && (
            <div className="pt-4 flex justify-end">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(0, p - 1));
                    }}
                  />
                  <li className="px-2 text-sm text-muted-foreground self-center">
                    {t("admin.list.page")} {page + 1} / {Math.max(1, pageCount)}
                  </li>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(pageCount - 1, p + 1));
                    }}
                  />
                </PaginationContent>
              </Pagination>
            </div>
          )}
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
              {editing?.id ? t("admin.category.edit") : t("admin.category.new")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("field.nameSr")}</div>
                <Input
                  value={editing?.name ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...(prev as any),
                      name: e.target.value,
                    }))
                  }
                  placeholder="npr. Pića i hrana"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("field.nameEn")}</div>
                <Input
                  value={editing?.nameEn ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...(prev as any),
                      nameEn: e.target.value,
                    }))
                  }
                  placeholder="e.g. Drinks & Food"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("field.slug")}</div>
                <Input
                  value={editing?.slug ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...(prev as any),
                      slug: e.target.value.toLowerCase(),
                    }))
                  }
                  placeholder="pica-i-hrana"
                />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">{t("field.iconHint")}</div>
                <Input
                  value={editing?.icon ?? ""}
                  onChange={(e) =>
                    setEditing((prev) => ({
                      ...(prev as any),
                      icon: e.target.value,
                    }))
                  }
                  placeholder="🍽️"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline">{t("action.cancel")}</Button>
            </DialogClose>
            <Button onClick={onSubmit}>
              {editing?.id ? t("action.save") : t("action.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
