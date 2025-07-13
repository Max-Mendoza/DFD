"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X } from "lucide-react"

interface SearchInputProps {
    placeholder?: string
    onSearch?: (value: string) => void
    className?: string
    autoFocus?: boolean
}

export default function SearchInput({
    placeholder = "Buscar...",
    onSearch,
    className = "",
    autoFocus = false,
}: SearchInputProps) {
    const [value, setValue] = useState("")
    const [isFocused, setIsFocused] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus()
        }
    }, [autoFocus])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        if (onSearch) {
            onSearch(e.target.value)
        }
    }

    const handleClear = () => {
        setValue("")
        if (onSearch) {
            onSearch("")
        }
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (onSearch) {
            onSearch(value)
        }
    }

    return (
        <motion.form
            className={`relative ${className}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
        >
            <div
                className={`
          relative flex items-center w-full rounded-lg
          transition-all duration-300 ease-in-out
          ${isFocused
                        ? "bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_0_0_4px_rgba(255,255,255,0.1)]"
                        : "bg-white/5 hover:bg-white/8"
                    }
        `}
            >
                <div className="flex items-center justify-center w-10 h-10 text-white/60">
                    <Search size={18} />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="
            w-full h-10 bg-transparent text-white outline-none
            placeholder:text-white/40 text-sm
          "
                />

                <AnimatePresence>
                    {value && (
                        <motion.button
                            type="button"
                            onClick={handleClear}
                            className="
                flex items-center justify-center w-10 h-10
                text-white/60 hover:text-white
                transition-colors duration-200
              "
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.15 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <X size={16} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            
            <AnimatePresence>
                {isFocused && value.length > 0 && (
                    <motion.div
                        className="
              absolute top-full left-0 right-0 mt-2
              bg-[#1C0740]/95 backdrop-blur-md
              border border-white/10 rounded-lg
              shadow-lg overflow-hidden z-50
            "
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="p-2 text-sm text-white/60">Resultados para "{value}"</div>

                        
                        <div className="border-t border-white/10">
                            {value && (
                                <div className="p-3 hover:bg-white/5 transition-colors duration-200 cursor-pointer">
                                    <div className="text-white text-sm">Resultado de ejemplo</div>
                                    <div className="text-white/50 text-xs mt-1">Descripción del resultado</div>
                                </div>
                            )}

                            
                            <div className="p-3 text-center text-white/40 text-sm">Presiona Enter para buscar</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.form>
    )
}

