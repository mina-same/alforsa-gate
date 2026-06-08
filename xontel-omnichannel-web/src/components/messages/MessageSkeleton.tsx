import { Skeleton } from "../ui/skeleton";

export default function MessageSkeleton() {
  return (
    <div className="flex-1 min-h-0 bg-whatsapp">
      <div className="h-full px-3 sm:px-4 py-6 space-y-3 overflow-hidden">
        <div className="flex items-center justify-center">
          <Skeleton className="h-6 w-28 rounded-full bg-xon-surface-container-hover/70" />
        </div>

        {[
          { mine: false, lines: 2, w: "w-[72%] sm:w-[55%]", avatar: true },
          { mine: true, lines: 1, w: "w-[58%] sm:w-[44%]", avatar: false },
          { mine: true, lines: 3, w: "w-[78%] sm:w-[60%]", avatar: false },
          { mine: false, lines: 1, w: "w-[46%] sm:w-[36%]", avatar: true },
          { mine: false, lines: 3, w: "w-[80%] sm:w-[62%]", avatar: true },
          { mine: true, lines: 2, w: "w-[66%] sm:w-[52%]", avatar: false },
        ].map((row, idx) => (
          <div
            key={idx}
            className={row.mine ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                row.mine
                  ? "flex items-end gap-2 max-w-full"
                  : "flex items-end gap-2 max-w-full"
              }
            >
              {!row.mine && row.avatar ? (
                <Skeleton
                  variant="circle"
                  className="h-8 w-8 bg-xon-surface-container-hover/70"
                />
              ) : null}

              <div
                className={
                  row.mine
                    ? `bg-xon-msg-bg-sent/40 ${row.w} rounded-lg rounded-tr-none shadow-sm px-3 py-2`
                    : `bg-xon-msg-bg-received/40 ${row.w} rounded-lg rounded-tl-none shadow-sm border border-xon-surface-outline/60 px-3 py-2`
                }
              >
                <div className="space-y-2">
                  {Array.from({ length: row.lines }).map((_, lineIdx) => (
                    <Skeleton
                      key={lineIdx}
                      variant="text"
                      className={`h-3 bg-xon-surface-container-hover/70 ${
                        lineIdx === row.lines - 1
                          ? row.lines === 1
                            ? "w-2/3"
                            : "w-1/2"
                          : "w-full"
                      }`}
                    />
                  ))}

                  <div className="flex justify-end">
                    <Skeleton
                      variant="text"
                      className="h-2 w-10 bg-xon-surface-container-hover/70"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-center pt-2">
          <Skeleton className="h-6 w-24 rounded-full bg-xon-surface-container-hover/70" />
        </div>
      </div>
    </div>
  );
}
