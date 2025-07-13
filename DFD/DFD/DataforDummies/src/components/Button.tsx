"use client"
import * as React from "react"
import { cn } from "@lib/utils"
import { Loader2 } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
  startIcon?: LucideIcon
  endIcon?: LucideIcon
  colorIcon?: "white" | "black"
}

export const AnimatedButton = React.forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      startIcon: StartIcon,
      endIcon: EndIcon,
      colorIcon: colorIcon,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2 rounded-lg font-medium",
          "transition-all duration-200 ease-out active:scale-95",
          "hover:-translate-y-0.5 hover:shadow-lg",
          "disabled:pointer-events-none disabled:opacity-50",

          // Variants
          variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
          variant === "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
          variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
          variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",

          // Sizes
          size === "default" && "h-10 px-4 py-2",
          size === "sm" && "h-9 px-3",
          size === "lg" && "h-11 px-8",
          size === "icon" && "h-10 w-10",

          className,
        )}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {StartIcon && <StartIcon className={`h-4 w-4`} color={`${colorIcon}`} />}
            {children}
            {EndIcon && <EndIcon className={`h-4 w-4 `} color={`${colorIcon}`} />}
          </>
        )}
      </button>
    )
  },
)
AnimatedButton.displayName = "AnimatedButton"

