"use client";

import { useTranslations } from "next-intl";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function UpdateCard() {
  const t = useTranslations("updates");
  return (
    <Card className="mb-4 break-inside-avoid md:mb-6">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("manual")}</CardDescription>
        <a
          className="text-sm underline"
          href="https://github.com/dunvu0/ARTEX/blob/main/FORK.md"
          target="_blank"
          rel="noreferrer"
        >
          {t("instructions")}
        </a>
      </CardHeader>
    </Card>
  );
}
