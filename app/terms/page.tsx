"use client";

import { Card, CardContent } from "@/components/ui/card";
import TermsContent from "@/components/legal/TermsContent";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6 md:p-10">
          <TermsContent />
        </CardContent>
      </Card>
    </div>
  );
}



