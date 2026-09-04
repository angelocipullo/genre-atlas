"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { detectPreferredLocale } from "@/src/i18n/locales";

export default function RootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/${detectPreferredLocale()}`);
  }, [router]);
  return null;
}
