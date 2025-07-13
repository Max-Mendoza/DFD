"use client"

export default function Relationship({ start, end, type, scale, selected, onSelect, id }) {
    // Calculate start and end points
    const startX = start.x * scale + 128 * scale // half of entity width
    const startY = start.y * scale + 60 * scale
    const endX = end.x * scale + 128 * scale
    const endY = end.y * scale + 60 * scale

    // Calculate midpoint for the label
    const midX = (startX + endX) / 2
    const midY = (startY + endY) / 2

    // Determine line style based on relationship type
    const strokeColor = selected ? "#250d46" : "#6B7280"
    const strokeWidth = selected ? 3 : 2
    const strokeDasharray = type === "manyToMany" ? "5,5" : "none"

    return (
        <g onClick={() => onSelect(id)} style={{ cursor: "pointer" }}>
            <defs>
                <marker
                    id={`arrowhead-${selected ? "selected" : "normal"}`}
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                >
                    <polygon points="0 0, 10 3.5, 0 7" fill={selected ? "#250d46" : "#6B7280"} />
                </marker>
            </defs>

            {/* Straight line for the relationship */}
            <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                markerEnd={`url(#arrowhead-${selected ? "selected" : "normal"})`}
            />

            {/* Circle for oneToMany relationships at the start point */}
            {type === "oneToMany" && (
                <circle cx={startX} cy={startY} r={selected ? 5 : 4} fill={selected ? "#250d46" : "#6B7280"} />
            )}

            {/* Relationship label */}
            <foreignObject x={midX - 30} y={midY - 15} width="60" height="30">
                <div
                    className={`flex items-center justify-center ${selected ? "bg-[#250d46] text-white" : "bg-white text-gray-700 border border-gray-300"
                        } rounded-md px-2 py-1 text-xs font-medium shadow-sm`}
                    style={{ cursor: "pointer" }}
                >
                    {type === "oneToMany" ? "1:N" : type === "manyToMany" ? "N:M" : "1:1"}
                </div>
            </foreignObject>
        </g>
    )
}
