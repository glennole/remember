"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ShoppingListPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to shopping lists overview since individual lists use dynamic routes
    router.push("/shopping-lists");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Redirecting to shopping lists...</div>
    </div>
  );
} 