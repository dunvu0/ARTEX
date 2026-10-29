"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useLocaleFormatting } from "@/i18n/formatting";

import { cn } from "@/lib/utils";

export function LiveClock({ className }: { className?: string }) {
  const t = useTranslations("header");
  const format = useLocaleFormatting();
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const update = () => setNow(new Date());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <time
      role="timer"
      className={cn(
        "hidden rounded-md border bg-muted/40 px-2 py-1 font-mono text-[11px] text-muted-foreground tabular-nums sm:inline-flex",
        className,
      )}
      dateTime={now?.toISOString()}
      aria-label={t("currentTime")}
      title={t("localTime")}
    >
      {now ? format.dateTime(now, "timestamp") : "---- -- -- --:--:--"}
    </time>
  );
}
