"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface MaterialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  helperText?: string
  startIcon?: LucideIcon
  endIcon?: LucideIcon
}

export const MaterialInput = React.forwardRef<HTMLInputElement, MaterialInputProps>(
  ({ className, type, label, error, helperText, startIcon: StartIcon, endIcon: EndIcon, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    return (
      <div className="relative">
        <div
          className={cn(
            "group relative rounded-t-lg border border-b-2 transition-all duration-200",
            error
              ? "border-destructive"
              : isFocused
                ? "border-primary"
                : "border-input hover:border-muted-foreground/50",
            StartIcon ? "pl-10" : "pl-4",
            EndIcon ? "pr-10" : "pr-4",
            "py-4",
            className,
          )}
        >
          {StartIcon && (
            <StartIcon
              className={cn(
                "absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors",
                error ? "text-destructive" : isFocused ? "text-primary" : "text-muted-foreground",
              )}
            />
          )}
          <label
            className={cn(
              "pointer-events-none absolute left-4 top-4 origin-left transform text-sm transition-all duration-200",
              StartIcon && "left-10",
              (isFocused || hasValue) && "-translate-y-3 scale-75",
              error ? "text-destructive" : isFocused ? "text-primary" : "text-muted-foreground",
            )}
          >
            {label}
          </label>
          <input
            type={type}
            className={cn(
              "block w-full border-0 bg-transparent p-0 text-base placeholder-transparent focus:outline-none focus:ring-0",
              error ? "text-destructive" : "text-foreground",
            )}
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...props}
          />
          {EndIcon && (
            <EndIcon
              className={cn(
                "absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors",
                error ? "text-destructive" : isFocused ? "text-primary" : "text-muted-foreground",
              )}
            />
          )}
        </div>
        {(error || helperText) && (
          <span className={cn("mt-1.5 text-xs", error ? "text-destructive" : "text-muted-foreground")}>
            {error || helperText}
          </span>
        )}
      </div>
    )
  },
)
MaterialInput.displayName = "MaterialInput"

