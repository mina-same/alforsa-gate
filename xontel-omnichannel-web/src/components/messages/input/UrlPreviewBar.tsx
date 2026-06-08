import React from "react";

import { X } from "lucide-react";
import { Button } from "@components/ui/button";

import LinkPreview from "../LinkPreview";

export default function UrlPreviewBar({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div className="px-4 py-2 bg-xon-surface-container-hover border-b border-xon-surface-outline relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2 h-6 w-6"
        onClick={onClose}
      >
        <X className="h-3 w-3" />
      </Button>

      <LinkPreview url={url} />
    </div>
  );
}
