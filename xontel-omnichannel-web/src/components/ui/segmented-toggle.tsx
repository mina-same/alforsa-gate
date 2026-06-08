import * as React from "react";
import { cn } from "@/lib/utils";

interface SegmentedToggleProps {
    value: string;
    onChange: (val: string) => void;
    options: { label: string; value: string }[];
    className?: string;
}

export function SegmentedToggle({
    value,
    onChange,
    options,
    className
}: SegmentedToggleProps) {
    return (
        <div
            className={cn(
                "flex items-center bg-xon-surface-container-hover border border-xon-surface-outline p-1 rounded-lg w-full",
                className
            )}
        >
            {options.map((opt) => {
                const active = opt.value === value;

                return (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            "flex-1 py-1 text-sm rounded-lg transition-all",
                            active
                                ? "bg-xon-surface-container text-xon-text-primary shadow-sm hover:bg-xon-surface-container"
                                : "text-xon-text-secondary hover:bg-xon-surface-container-hover"
                        )}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
