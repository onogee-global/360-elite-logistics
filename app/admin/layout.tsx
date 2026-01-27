"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/lib/admin-context";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);
  const { isAdmin, loading, isAuthenticated } = useAdmin();

  // Decide once admin state is known
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      const target = pathname || "/admin";
      const search = new URLSearchParams({ redirect: target }).toString();
      router.replace(`/login?${search}`);
      return;
    }
    if (isAdmin) {
      setAuthorized(true);
    } else {
      toast({
        title: "Pristup odbijen",
        description: "Samo administratori mogu pristupiti ovoj stranici.",
        variant: "destructive",
      });
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated, isAdmin, pathname]);

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <AdminHeader />

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
