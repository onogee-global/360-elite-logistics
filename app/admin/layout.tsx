"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin/admin-header";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { supabase, getUserProfile } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) {
        router.replace("/login?redirect=/admin");
        return;
      }
      try {
        const profile = await getUserProfile(user.id);
        if (!cancelled && profile?.isAdmin) {
          setAuthorized(true);
        } else {
          toast({
            title: "Pristup odbijen",
            description: "Samo administratori mogu pristupiti ovoj stranici.",
            variant: "destructive",
          });
          router.replace("/");
        }
      } catch {
        router.replace("/");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, toast]);

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
