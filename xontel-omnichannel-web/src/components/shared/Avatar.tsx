import React from "react";

type AvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-5 h-5",
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
};

// Generate consistent colors based on letter using Xon color system
const getColorPalette = (letter: string) => {
  const letterIndex = letter.toUpperCase().charCodeAt(0) - 65; // A=0, B=1, etc.
  const colorPalettes = [
    { bg: "bg-xon-red", text: "text-xon-text-inverse" },
    { bg: "bg-xon-yellow", text: "text-xon-text-primary" },
    { bg: "bg-xon-green", text: "text-xon-text-inverse" },
    { bg: "bg-xon-blue", text: "text-xon-text-inverse" },
    { bg: "bg-xon-purple", text: "text-xon-text-inverse" },
    { bg: "bg-xon-primary", text: "text-xon-primary-on" },
    { bg: "bg-xon-red", text: "text-xon-text-inverse" },
    { bg: "bg-xon-green", text: "text-xon-text-inverse" },
    { bg: "bg-xon-blue", text: "text-xon-text-inverse" },
    { bg: "bg-xon-purple", text: "text-xon-text-inverse" },
    { bg: "bg-xon-primary", text: "text-xon-primary-on" },
    { bg: "bg-xon-yellow", text: "text-xon-text-primary" },
    { bg: "bg-xon-red", text: "text-xon-text-inverse" },
    { bg: "bg-xon-green", text: "text-xon-text-inverse" },
    { bg: "bg-xon-blue", text: "text-xon-text-inverse" },
    { bg: "bg-xon-purple", text: "text-xon-text-inverse" },
    { bg: "bg-xon-primary", text: "text-xon-primary-on" },
    { bg: "bg-xon-surface-gray", text: "text-xon-text-inverse" },
    { bg: "bg-xon-red", text: "text-xon-text-inverse" },
    { bg: "bg-xon-green", text: "text-xon-text-inverse" },
    { bg: "bg-xon-blue", text: "text-xon-text-inverse" },
    { bg: "bg-xon-purple", text: "text-xon-text-inverse" },
    // Repeat some colors for letters beyond U
    { bg: "bg-xon-primary", text: "text-xon-primary-on" },
    { bg: "bg-xon-yellow", text: "text-xon-text-primary" },
    { bg: "bg-xon-blue", text: "text-xon-text-inverse" },
  ];

  const paletteIndex = Math.abs(letterIndex) % colorPalettes.length;
  return colorPalettes[paletteIndex];
};

export default function Avatar({
  src,
  name,
  size = "md",
  className,
}: {
  src?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}) {
  const sizeClass = className || sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        className={`${sizeClass} shrink-0 rounded-full object-cover`}
        alt={name || "Avatar"}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          const parent = target.parentElement;
          if (parent) {
            const fallback = document.createElement("div");
            const firstLetter = name?.trim()?.[0]?.toUpperCase() || "?";
            const colors = getColorPalette(firstLetter);
            const fontSizeClass = size === "xs" ? "text-[10px]" : "text-sm";
            fallback.className = `${sizeClass} rounded-full ${colors.bg} ${colors.text} flex items-center justify-center ${fontSizeClass} font-semibold`;
            fallback.textContent = firstLetter;
            parent.appendChild(fallback);
          }
        }}
      />
    );
  }

    const firstLetter = name?.trim()?.[0]?.toUpperCase() || "?";
    const colors = getColorPalette(firstLetter);
    const fontSizeClass = size === "xs" ? "text-[10px]" : "text-lg";

    return (
        <>
            {!firstLetter ? (
                <div className={`${sizeClass} rounded-full ${colors.bg} ${colors.text} flex items-center justify-center ${fontSizeClass} font-semibold`}></div>
            ) : (
                <div
                    className={`${sizeClass} rounded-full ${colors.bg} ${colors.text} flex items-center justify-center ${fontSizeClass} font-semibold`}
                >
                    {firstLetter.toUpperCase()}
                </div>
            )}
        </>
    );
}
