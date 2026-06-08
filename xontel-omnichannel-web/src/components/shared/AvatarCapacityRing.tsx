import React, { useMemo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AvatarCapacityRing({
  current,
  max,
  size = 44,
  strokeWidth = 3,
  tooltip,
  children,
}: {
  current: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  tooltip: string;
  children: React.ReactNode;
}) {
  const normalized = useMemo(() => {
    const maxParsed = max != null ? Number(max) : undefined;
    const currentParsed = Number.isFinite(Number(current)) ? Number(current) : 0;

    const maxValid =
      maxParsed != null && Number.isFinite(maxParsed) && maxParsed > 0
        ? maxParsed
        : undefined;
    const currentValid = Number.isFinite(currentParsed) && currentParsed >= 0 ? currentParsed : 0;

    const percent =
      maxValid != null ? Math.min(100, Math.max(0, (currentValid / maxValid) * 100)) : 0;

    return { maxValid, currentValid, percent };
  }, [current, max]);

  const radius = useMemo(() => {
    const r = size / 2 - strokeWidth / 2;
    return r > 0 ? r : 0;
  }, [size, strokeWidth]);

  const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

  const dashOffset = useMemo(
    () => circumference - (normalized.percent / 100) * circumference,
    [circumference, normalized.percent]
  );

  const ringColor = useMemo(() => {
    if (normalized.maxValid == null) return "var(--xon-color-surface-outline)";
    return normalized.currentValid >= normalized.maxValid
      ? "var(--xon-color-text-red)"
      : "var(--xon-color-text-green)";
  }, [normalized.currentValid, normalized.maxValid]);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="relative inline-flex items-center justify-center"
          style={{ width: size, height: size }}
          aria-label={tooltip}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0 -rotate-90"
          >
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--xon-color-surface-outline)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              opacity={0.7}
            />
            {normalized.maxValid != null ? (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={ringColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                style={{
                  transition:
                    "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1), stroke 250ms ease",
                }}
              />
            ) : null}
          </svg>

          <div className="flex items-center justify-center" style={{ padding: 2 }}>
            {children}
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        className="bg-xon-surface-container text-xon-text-primary border border-xon-surface-outline"
      >
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
