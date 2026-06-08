import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/lib/utils"

const ScrollArea = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
        viewportRef?: React.RefObject<HTMLDivElement>
        onScroll?: React.UIEventHandler<HTMLDivElement>
    }
>(({ className, children, viewportRef, onScroll, ...props }, ref) => (
    <ScrollAreaPrimitive.Root
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        {...props}
    >
        <ScrollAreaPrimitive.Viewport
            ref={viewportRef}
            onScroll={onScroll}
            className="h-full w-full rounded-[inherit]"
        >
            {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollBar />
        <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
))
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
    React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => {
    const isRTL = document.documentElement.dir === 'rtl'

    return (
        <ScrollAreaPrimitive.ScrollAreaScrollbar
            ref={ref}
            orientation={orientation}
            className={cn(
                "flex touch-none select-none transition-colors",
                orientation === "vertical" &&
                (isRTL
                    ? "h-full w-[5px] border-l border-l-transparent p-[0.5px] left-0"
                    : "h-full w-[5px] border-r border-r-transparent p-[0.5px] right-0"),
                orientation === "horizontal" &&
                "h-[5px] flex-col border-t border-t-transparent p-[0.5px]",
                className
            )}
            style={isRTL && orientation === "vertical" ? { left: 0, right: 'auto' } : {}}
            {...props}
        >
            <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-black/40 dark:bg-white/40 hover:bg-black/70 dark:hover:bg-white/70 transition-colors duration-200" />
        </ScrollAreaPrimitive.ScrollAreaScrollbar>
    )
})
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
