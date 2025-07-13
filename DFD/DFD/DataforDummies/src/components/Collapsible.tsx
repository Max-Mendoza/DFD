"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface CollapsibleContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const CollapsibleContext = createContext<CollapsibleContextType | undefined>(undefined)

interface CollapsibleProps {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

export const Collapsible: React.FC<CollapsibleProps> = ({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
  className = "",
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)

  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = onOpenChange || setUncontrolledOpen

  return (
    <CollapsibleContext.Provider value={{ open, setOpen }}>
      <div className={`data-[state=${open ? "open" : "closed"}] ${className}`} data-state={open ? "open" : "closed"}>
        {children}
      </div>
    </CollapsibleContext.Provider>
  )
}

interface CollapsibleTriggerProps {
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent) => void
}

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  children,
  className = "",
  onClick,
  ...props
}) => {
  const context = useContext(CollapsibleContext)

  if (!context) {
    throw new Error("CollapsibleTrigger must be used within a Collapsible component")
  }

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) onClick(e)
    context.setOpen(!context.open)
  }

  return (
    <button className={className} onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface CollapsibleContentProps {
  children: React.ReactNode
  className?: string
}

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({ children, className = "" }) => {
  const context = useContext(CollapsibleContext)

  if (!context) {
    throw new Error("CollapsibleContent must be used within a Collapsible component")
  }

  if (!context.open) {
    return null
  }

  return <div className={className}>{children}</div>
}
