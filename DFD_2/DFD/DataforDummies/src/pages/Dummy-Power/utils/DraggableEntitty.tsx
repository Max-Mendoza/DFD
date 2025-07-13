"use client"
import { useState, useEffect, ReactNode } from "react"
import { Move } from "lucide-react"

interface Position {
    x: number
    y: number
}

interface DraggableEntityProps {
    children: ReactNode
    initialPosition: Position
    onDrag?: (id: string, position: Position) => void
    id: string
    scale: number
    selected: boolean
    onSelect: (id: string) => void
}

export default function DraggableEntity({
    children,
    initialPosition,
    onDrag,
    id,
    scale,
    selected,
    onSelect
}: DraggableEntityProps) {
    const [position, setPosition] = useState<Position>(initialPosition)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 })

    // Handle mouse down to start dragging
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true)
        setDragStart({
            x: e.clientX,
            y: e.clientY,
        })
        e.stopPropagation()
    }

    // Handle mouse move while dragging
    const handleMouseMove = (e: MouseEvent) => {
        if (!isDragging) return

        const dx = (e.clientX - dragStart.x) / scale
        const dy = (e.clientY - dragStart.y) / scale

        const newPosition = {
            x: position.x + dx,
            y: position.y + dy,
        }

        setPosition(newPosition)
        setDragStart({
            x: e.clientX,
            y: e.clientY,
        })

        if (onDrag) {
            onDrag(id, newPosition)
        }
    }

    // Handle mouse up to stop dragging
    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // Add and remove event listeners using useEffect
    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove)
            window.addEventListener("mouseup", handleMouseUp)
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseup", handleMouseUp)
        }
    }, [isDragging, dragStart, position, scale, onDrag, id])

    return (
        <div
            style={{
                position: "absolute",
                left: position.x * scale,
                top: position.y * scale,
                zIndex: selected ? 30 : isDragging ? 40 : 10,
                cursor: isDragging ? "grabbing" : "grab",
                transform: `scale(${scale})`,
                transformOrigin: "0 0",
            }}
            onClick={() => onSelect(id)}
            className={`w-64 bg-white border ${selected ? "border-[#250d46] shadow-lg" : "border-gray-300 shadow-md"
                } rounded-lg p-4`}
        >
            <div
                className="absolute top-2 right-2 cursor-move text-gray-500 hover:text-[#250d46]"
                onMouseDown={handleMouseDown}
            >
                <Move size={14} />
            </div>
            {children}
        </div>
    )
}