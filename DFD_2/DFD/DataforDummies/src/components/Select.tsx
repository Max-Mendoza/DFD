"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, Check } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface CustomSelectProps {
  options: SelectOption[]
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export default function CustomSelect({
  options,
  placeholder = "Seleccionar...",
  value,
  onChange,
  className = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState<SelectOption | null>(
    options.find((option) => option.value === value) || null,
  )
  const selectRef = useRef<HTMLDivElement>(null)

  // Update selected option when value prop changes
  useEffect(() => {
    const option = options.find((option) => option.value === value)
    if (option) {
      setSelectedOption(option)
    }
  }, [value, options])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSelect = (option: SelectOption) => {
    setSelectedOption(option)
    onChange(option.value)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={`relative w-full ${className}`}>
      <button
        type="button"
        className={`flex items-center justify-between w-full px-4 py-2.5 text-left 
                  bg-white/4 border border-purple-900/20 rounded-lg 
                  text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-white/8"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        disabled={disabled}
      >
        <span className={`block truncate ${!selectedOption ? "text-purple-300/70" : ""}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="ml-2">
          <ChevronDown className="h-5 w-5 text-purple-400" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 w-full mt-1 py-1 bg-[#1e1230] border border-purple-900/20 
                      rounded-lg shadow-lg max-h-60 overflow-auto focus:outline-none"
            role="listbox"
            tabIndex={-1}
          >
            {options.map((option) => (
              <motion.li
                key={option.value}
                whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.2)" }}
                className={`cursor-pointer select-none relative py-2 pl-10 pr-4 
                          ${selectedOption?.value === option.value ? "bg-purple-900/20" : ""}`}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={selectedOption?.value === option.value}
              >
                <span
                  className={`block truncate ${selectedOption?.value === option.value ? "font-medium" : "font-normal"}`}
                >
                  {option.label}
                </span>
                {selectedOption?.value === option.value && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}

