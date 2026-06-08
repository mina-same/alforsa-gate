import * as React from "react"
 
import { cn } from "@/lib/utils"
 
type SkeletonVariant = "default" | "text" | "circle"
 
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
}
 
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "animate-pulse bg-muted",
          variant === "default" && "rounded-md",
          variant === "text" && "rounded-sm",
          variant === "circle" && "rounded-full",
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"
 
export { Skeleton }
