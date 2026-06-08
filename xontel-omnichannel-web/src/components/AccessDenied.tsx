import React from "react";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AccessDenied() {
  const { t } = useTranslation("chat");

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
      <Lock className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">{t("access_denied.title")}</h2>
      <p className="text-sm text-muted-foreground">
        {t("access_denied.description")}
      </p>
    </div>
  );
}
