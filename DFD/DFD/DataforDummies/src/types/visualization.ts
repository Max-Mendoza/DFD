export type TableType = {
  name: string
  description: string
  columns: string[]
  values: Record<string, any[]>
  types: string[]
}

export type Tables = Record<string, TableType>

export type Entity = {
  id: string
  name: string
  description: string
  position: { x: number; y: number }
  columns: {
    name: string
    type: string
    isPrimary?: boolean
  }[]
}

export type Entities = Record<string, Entity>

export interface FieldEntry {
  fieldName: string
  displayName: string
  aggregation?: "sum" | "avg" | "count" | "max" | "min" | "none"
  dataType: "string" | "number" | "date" | "boolean" | "currency"
  sourceTable: string
}

export interface Slot {
  role: string
  label: string
  acceptedTypes: string[]
  multipleAllowed: boolean
  required: boolean
  fields: FieldEntry[]
}

export interface VisualizationConfig {
  id: number
  type: string
  title: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  slots: Slot[]
  formatOptions: {
    title: {
      show: boolean
      text: string
      fontSize: number
      color: string
    }
    legend: {
      show: boolean
      position: "top" | "bottom" | "left" | "right"
      fontSize: number
    }
    colors: {
      scheme: string
      custom: string[]
    }
    axes: {
      xTitle: string
      yTitle: string
      showGrid: boolean
    }
  }
  interactions: Record<number, "filter" | "highlight" | "none">
  filters: Record<string, any>
}

export interface VisualizationViewProps {
  isDarkMode: boolean
  entities: Entities
  tables: Tables
  showSidebar: boolean
  setShowSidebar: (show: boolean) => void
}
