import React, { useState } from "react";

// ─── Design Tokens ────────────────────────────────────────────────────────────
const TOKENS = {
  blue: "#1480C4",
  blueSoft: "rgba(20,128,196,0.12)",
  blueMid: "rgba(20,128,196,0.25)",
  white: "#FFFFFF",
  divider: "rgba(255,255,255,0.65)",
};

const GAP = 1.5; // hairline gap between cells (px)

// ─── Types ────────────────────────────────────────────────────────────────────
interface MemberSlot {
  uri: string | null;
  name: string | null;
  isOverflow?: boolean;
  overflowCount?: number;
}

interface RowDef {
  cols: number;
  h: number;
}

interface GroupAvatarGridProps {
  /** Avatar URIs — null/undefined/empty strings fall back to initials */
  avatars: (string | null | undefined)[];
  /** Names paired to each avatar; drives fallback initials */
  names?: (string | null | undefined)[];
  /** Outer diameter in px (default 48) */
  size?: number;
  /** Maximum slots to render, including the overflow badge if needed. Must be 1–9 (default 9 = show up to 9 members before collapsing). */
  maxDisplay?: number;
  /** Fallback cell background colour */
  fallbackColor?: string;
  /** Border colour around the whole avatar */
  borderColor?: string;
  /** Border width around the whole avatar */
  borderWidth?: number;
  /** Layout mode: 'tiling' fills the circle, 'grid' uses uniform cells like the image */
  layout?: "tiling" | "grid";
  /** Optional click handler */
  onClick?: () => void;
  /** Optional CSS class */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getInitials(name?: string | null): string {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

function fallbackFontSize(cellSize: number): number {
  return Math.max(7, Math.round(cellSize * 0.36));
}

/**
 * Returns rows that tile the circle with no empty space.
 * 1 → full circle (handled separately)
 * 2 → [2-col × full-height]
 * 3 → [2-col half] + [1-col half]
 * 4 → [2-col half] + [2-col half]
 * 5 → [3-col half] + [2-col half]
 * 6 → [3-col half] + [3-col half]
 * 7 → [4-col half] + [3-col half]
 * 8 → [4-col half] + [4-col half]
 * 9  → [3-col third] + [3-col third] + [3-col third]
 */
function getRowDefs(slotCount: number, size: number): RowDef[] {
  const h1 = (size - GAP) / 2;
  const h3 = (size - 2 * GAP) / 3;

  const map: Record<number, RowDef[]> = {
    2: [{ cols: 2, h: size }],
    3: [
      { cols: 2, h: h1 },
      { cols: 1, h: h1 },
    ],
    4: [
      { cols: 2, h: h1 },
      { cols: 2, h: h1 },
    ],
    5: [
      { cols: 3, h: h1 },
      { cols: 2, h: h1 },
    ],
    6: [
      { cols: 3, h: h1 },
      { cols: 3, h: h1 },
    ],
    7: [
      { cols: 4, h: h1 },
      { cols: 3, h: h1 },
    ],
    8: [
      { cols: 4, h: h1 },
      { cols: 4, h: h1 },
    ],
    9: [
      { cols: 3, h: h3 },
      { cols: 3, h: h3 },
      { cols: 3, h: h3 },
    ],
  };

  // Fallback for out-of-range: 2-col rows
  if (!map[slotCount]) {
    const cols = 2;
    const rowCount = Math.ceil(slotCount / cols);
    const rowH = (size - (rowCount - 1) * GAP) / rowCount;
    return Array.from({ length: rowCount }, () => ({ cols, h: rowH }));
  }

  return map[slotCount];
}

/**
 * Decides how many real members to show and how many go in the overflow badge.
 * If total ≤ maxDisplay → show all, no badge.
 * Otherwise → pick the largest "clean" count (1–9) ≤ maxDisplay,
 * show count-1 real members, overflow badge takes the last slot.
 */
function computeSlots(
  total: number,
  maxDisplay: number
): { showCount: number; overflowCount: number } {
  if (total <= maxDisplay) return { showCount: total, overflowCount: 0 };

  const CLEAN = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const slots = CLEAN.filter((n) => n <= maxDisplay).pop() ?? maxDisplay;
  return { showCount: slots - 1, overflowCount: total - (slots - 1) };
}

// ─── Single cell ──────────────────────────────────────────────────────────────
const AvatarCell: React.FC<{
  slot: MemberSlot;
  width: number;
  height: number;
  fallbackColor: string;
}> = ({ slot, width, height, fallbackColor }) => {
  const [errored, setErrored] = useState(false);
  const fontSize = fallbackFontSize(Math.min(width, height));

  if (slot.isOverflow) {
    return (
      <div
        className="flex items-center justify-center overflow-hidden w-full h-full"
        style={{
          backgroundColor: TOKENS.blueMid,
        }}
      >
        <span
          style={{
            fontSize,
            color: TOKENS.blue,
            fontWeight: 800,
            letterSpacing: 0.3,
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          +{slot.overflowCount}
        </span>
      </div>
    );
  }

  if (slot.uri && !errored) {
    return (
      <img
        src={slot.uri}
        alt=""
        className="object-cover w-full h-full"
        onError={() => setErrored(true)}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center overflow-hidden w-full h-full"
      style={{
        backgroundColor: fallbackColor,
      }}
    >
      <span
        style={{
          fontSize,
          color: TOKENS.blue,
          fontWeight: 700,
          letterSpacing: 0.5,
          textAlign: "center",
          lineHeight: 1,
        }}
      >
        {getInitials(slot.name)}
      </span>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export const GroupAvatarGrid: React.FC<GroupAvatarGridProps> = ({
  avatars,
  names = [],
  size = 48,
  maxDisplay = 9,
  fallbackColor = TOKENS.blueSoft,
  borderColor = TOKENS.white,
  borderWidth = 2,
  layout = "grid",
  onClick,
  className,
}) => {
  // Build typed slot list
  const members: MemberSlot[] = avatars.map((a, i) => ({
    uri: typeof a === "string" && a.trim().length > 0 ? a : null,
    name: names[i] ?? null,
  }));

  const { showCount, overflowCount } = computeSlots(members.length, maxDisplay);

  const slots: MemberSlot[] = members.slice(0, showCount);
  if (overflowCount > 0) {
    slots.push({
      uri: null,
      name: null,
      isOverflow: true,
      overflowCount,
    });
  }
  const slotCount = slots.length;

  const containerClasses = [
    "relative flex-shrink-0 rounded-full overflow-hidden transition-transform duration-200 ease-out",
    onClick ? "cursor-pointer active:scale-[0.93] hover:scale-[0.98]" : "cursor-default",
    className,
  ].join(" ");

  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    borderWidth,
    borderColor,
    borderStyle: "solid",
    // boxShadow: `0 2px 4px ${TOKENS.blueMid}`,
  };

  // ── 0 members ───────────────────────────────────────────────────────────────
  if (slotCount === 0) {
    return (
      <div
        className={`${containerClasses} flex items-center justify-center`}
        style={{
          ...containerStyle,
          backgroundColor: fallbackColor,
        }}
        onClick={onClick}
      >
        <span
          style={{
            fontSize: size * 0.35,
            color: TOKENS.blue,
            fontWeight: 700,
            letterSpacing: 0.5,
            lineHeight: 1,
          }}
        >
          G
        </span>
      </div>
    );
  }

  // ── 1 member ────────────────────────────────────────────────────────────────
  if (slotCount === 1) {
    return (
      <div
        className={containerClasses}
        style={containerStyle}
        onClick={onClick}
      >
        <AvatarCell
          slot={slots[0]}
          width={size}
          height={size}
          fallbackColor={fallbackColor}
        />
      </div>
    );
  }

  // ── multi-member grid ────────────────────────────────────────────────────────
  if (layout === "grid") {
    // Uniform grid layout like the image - equal sized cells
    const gridCols = slotCount <= 2 ? 2 : slotCount <= 4 ? 2 : slotCount <= 6 ? 3 : slotCount <= 9 ? 3 : 4;
    const gridRows = Math.ceil(slotCount / gridCols);
    const cellSize = (size - (gridCols - 1) * GAP) / gridCols;
    const rowHeight = (size - (gridRows - 1) * GAP) / gridRows;

    return (
      <div
        className={containerClasses}
        style={containerStyle}
        onClick={onClick}
      >
        <div 
          className="w-full h-full grid"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${gridRows}, ${rowHeight}px)`,
            gap: `${GAP}px`,
          }}
        >
          {slots.map((slot, index) => (
            <div key={index} style={{ width: cellSize, height: rowHeight }}>
              <AvatarCell
                slot={slot}
                width={cellSize}
                height={rowHeight}
                fallbackColor={fallbackColor}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── multi-member tiling layout (original) ───────────────────────────────────
  const rowDefs = getRowDefs(slotCount, size);
  let slotIdx = 0;

  return (
    <div
      className={containerClasses}
      style={containerStyle}
      onClick={onClick}
    >
      <div className="flex flex-col w-full h-full">
        {rowDefs.map((rowDef, rIdx) => {
          const cellW = (size - (rowDef.cols - 1) * GAP) / rowDef.cols;
          const rowSlots = slots.slice(slotIdx, slotIdx + rowDef.cols);
          slotIdx += rowDef.cols;

          return (
            <React.Fragment key={rIdx}>
              {rIdx > 0 && (
                <div
                  style={{
                    height: GAP,
                    backgroundColor: TOKENS.divider,
                    flexShrink: 0,
                  }}
                />
              )}
              <div className="flex flex-row" style={{ height: rowDef.h, flexShrink: 0 }}>
                {rowSlots.map((slot, cIdx) => (
                  <React.Fragment key={cIdx}>
                    {cIdx > 0 && (
                      <div
                        style={{
                          width: GAP,
                          backgroundColor: TOKENS.divider,
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <div style={{ width: cellW, height: rowDef.h, flexShrink: 0 }}>
                      <AvatarCell
                        slot={slot}
                        width={cellW}
                        height={rowDef.h}
                        fallbackColor={fallbackColor}
                      />
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default GroupAvatarGrid;
