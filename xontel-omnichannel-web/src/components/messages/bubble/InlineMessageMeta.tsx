import React from "react";
import { Check, CheckCheck, Clock } from "lucide-react";

interface InlineMessageMetaProps {
  time: string;
  status?: "sent" | "delivered" | "read" | "sending" | "pending" | "failed" | string;
  isSender: boolean;
  light?: boolean;
  className?: string;
}

export default function InlineMessageMeta({
  time,
  status,
  isSender,
  light,
  className,
}: InlineMessageMetaProps) {
  const iconClassName = light ? "text-white/80" : "text-xon-text-secondary";
  const timeClassName = light ? "text-white/80" : "text-xon-text-primary/80";

  const renderIcon = () => {
    if (!isSender) return null;

    switch (status) {
      case "sent":
        return <Check className={`h-3 w-3 ${iconClassName}`} />;
      case "delivered":
        return <CheckCheck className={`h-3 w-3 ${iconClassName}`} />;
      case "read":
        return <CheckCheck className={`h-3 w-3 ${light ? "text-white/90" : "text-xon-primary"}`} />;
      case "sending":
      case "pending":
      default:
        return <Clock className={`h-3 w-3 ${iconClassName}`} />;
    }
  };

  return (
    <span
      className={
        `inline-flex items-center gap-1 text-[10px] leading-none select-none whitespace-nowrap ${
          className || ""
        }`
      }
    >
      <span className={`tracking-tight ${timeClassName}`}>{time}</span>
      {renderIcon()}
    </span>
  );
}
