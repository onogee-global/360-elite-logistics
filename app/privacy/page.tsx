"use client";

import { Card, CardContent } from "@/components/ui/card";
import PrivacyContent from "@/components/legal/PrivacyContent";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-6 md:p-10">
          <PrivacyContent />
        </CardContent>
      </Card>
    </div>
  );
}



