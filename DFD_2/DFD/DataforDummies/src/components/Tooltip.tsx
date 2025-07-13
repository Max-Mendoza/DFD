import React, { createContext, useContext, useState } from "react"

interface TooltipContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const TooltipContext = createContext<TooltipContextType | undefined>(undefined)

export const TooltipProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}

export const Tooltip: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false)

  return (
    <TooltipContext.Provider value={{ open, setOpen }}>
      <div className="relative inline-block">{children}</div>
    </TooltipContext.Provider>
  )
}

interface TooltipTriggerProps {
  asChild?: boolean
  children: React.ReactNode
}

export const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ asChild = false, children }) => {
  const context = useContext(TooltipContext)

  if (!context) {
    throw new Error("TooltipTrigger must be used within a Tooltip component")
  }

  const handleMouseEnter = () => context.setOpen(true)
  const handleMouseLeave = () => context.setOpen(false)

  if (asChild) {
    if (React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })
    } else {
      console.error("DropdownMenuTrigger: children must be a valid React element when 'asChild' is true.")
      return null
    }
  }
  

  return (
    <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {children}
    </div>
  )
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  className?: string
}

export const TooltipContent: React.FC<TooltipContentProps> = ({
  children,
  side = "top",
  align = "center",
  className = "",
}) => {
  const context = useContext(TooltipContext)

  if (!context) {
    throw new Error("TooltipContent must be used within a Tooltip component")
  }

  if (!context.open) {
    return null
  }

  const positions = {
    top: "bottom-full mb-2",
    right: "left-full ml-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
  }

  const alignments = {
    start: "origin-top-left",
    center: "origin-center",
    end: "origin-top-right",
  }

  return (
    <div
      className={`absolute z-50 px-3 py-1.5 text-sm bg-black text-white rounded-md ${positions[side]} ${alignments[align]} ${className}`}
    >
      {children}
      <div className="tooltip-arrow"></div>
    </div>
  )
}
