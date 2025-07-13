"use client"
import type { ReactElement } from "react"
import React, { createContext, useContext, useState, useRef, useEffect } from "react"

interface DropdownMenuContextType {
    open: boolean
    setOpen: (open: boolean) => void
}

const DropdownMenuContext = createContext<DropdownMenuContextType | undefined>(undefined)

export const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false)

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block">{children}</div>
        </DropdownMenuContext.Provider>
    )
}

interface DropdownMenuTriggerProps {
    asChild?: boolean
    children: React.ReactNode
}

export const DropdownMenuTrigger: React.FC<DropdownMenuTriggerProps> = ({ asChild = false, children }) => {
    const context = useContext(DropdownMenuContext)

    if (!context) {
        throw new Error("DropdownMenuTrigger must be used within a DropdownMenu component")
    }

    const handleClick = () => {
        context.setOpen(!context.open)
    }

    if (asChild) {
        if (React.isValidElement(children)) {
            return React.cloneElement(children as ReactElement<any>, {
                onClick: handleClick,
            })
        } else {
            console.error("DropdownMenuTrigger: children must be a valid React element when 'asChild' is true.")
            return null
        }
    }

    return <button onClick={handleClick}>{children}</button>
}

interface DropdownMenuContentProps {
    children: React.ReactNode
    className?: string
}

export const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ children, className = "" }) => {
    const context = useContext(DropdownMenuContext)
    const ref = useRef<HTMLDivElement>(null)

    if (!context) {
        throw new Error("DropdownMenuContent must be used within a DropdownMenu component")
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                context.setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [context])

    if (!context.open) {
        return null
    }

    return (
        <div
            ref={ref}
            className={`absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md animate-in ${className}`}
        >
            {children}
        </div>
    )
}

interface DropdownMenuItemProps {
    children: React.ReactNode
    className?: string
    onClick?: () => void
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({ children, className = "", onClick }) => {
    const context = useContext(DropdownMenuContext)

    if (!context) {
        throw new Error("DropdownMenuItem must be used within a DropdownMenu component")
    }

    const handleClick = () => {
        if (onClick) onClick()
        context.setOpen(false)
    }

    return (
        <button
            className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 ${className}`}
            onClick={handleClick}
        >
            {children}
        </button>
    )
}
