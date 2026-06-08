"use client";

import React, { ReactNode, useId, useMemo } from "react";
import { useTranslation } from "react-i18next";

type TooltipPosition = "left" | "right" | "top" | "bottom";

type TooltipProps = {
  error?: boolean;
  mismatch?: boolean;
  title: ReactNode;
  position?: TooltipPosition;
  children?: ReactNode;
};

const XonTooltip = ({
  title,
  children,
  error = false,
  mismatch = false,
  position = "right",
}: TooltipProps) => {
  const { i18n } = useTranslation();
  const id = useId();

  const locale = i18n?.language || "en";

  const computedPosition = useMemo(() => {
    if (locale === "ar") {
      if (position === "left") return "right";
      if (position === "right") return "left";
    }
    return position;
  }, [locale, position]);

  const isPrimitiveTitle =
    typeof title === "string" || typeof title === "number";

  const posClasses = {
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
  };

  return (
    <span className={`relative inline-flex group xon-tooltip-${id}`}> 
      {children ? (
        <span className="inline-flex items-center">{children}</span>
      ) : error ? (
        <span className="inline-flex items-center text-red-500" aria-hidden>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 8v5" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16h.01" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      ) : mismatch ? (
        <span className="inline-flex items-center text-yellow-500" aria-hidden>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="1.5" />
            <path d="M12 9v4" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 17h.01" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      ) : (
        <span className="inline-flex items-center text-sky-500" aria-hidden>
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 8v4" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 16h.01" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      )}

      <div
        role="tooltip"
        className={`pointer-events-none absolute z-50 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transform transition-opacity duration-150 ${posClasses[computedPosition]} min-w-[200px] max-w-xs`}
        aria-hidden={isPrimitiveTitle ? undefined : undefined}
      >
        <div
          className={`text-[11px] font-medium leading-tight break-words whitespace-normal bg-gray-900 text-white px-3 py-2 rounded shadow-lg ${
            error ? "bg-red-600" : ""
          }`}
        >
          {isPrimitiveTitle ? String(title) : title}
        </div>
      </div>
    </span>
  );
};

export default XonTooltip;
