"use client"

import React, { useRef, useEffect, useMemo } from "react"
import * as echarts from "echarts"
import type { VisualizationConfig, Tables } from "@/types/visualization"

interface EChartsChartProps {
  viz: VisualizationConfig
  tables: Tables
  globalFilters: Record<string, any>
  applyCrossFilter: (sourceVizId: number, filterField: string, filterValue: any) => void
}

const EChartsChart: React.FunctionComponent<EChartsChartProps> = React.memo(
  ({ viz, tables, globalFilters, applyCrossFilter }) => {
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstanceRef = useRef<echarts.ECharts | null>(null)

    // Función para procesar datos de visualización
    const processVisualizationData = useMemo(() => {
      const tableKey = Object.keys(tables)[0]
      if (!tableKey || !tables[tableKey]?.values) return null

      const tableData = tables[tableKey]
      const { values } = tableData

      // Convertir datos columnares a filas
      const rowCount = tableData.columns.length > 0 ? values[tableData.columns[0]]?.length || 0 : 0
      let rows: Record<string, any>[] = []

      for (let i = 0; i < rowCount; i++) {
        const row: Record<string, any> = {}
        tableData.columns.forEach((column) => {
          row[column] = values[column]?.[i]
        })
        rows.push(row)
      }

      // Aplicar filtros
      const allFilters = { ...globalFilters, ...viz.filters }
      if (Object.keys(allFilters).length > 0) {
        rows = rows.filter((row) => {
          return Object.entries(allFilters).every(([field, value]) => {
            if (value === null || value === undefined) return true
            return row[field] === value
          })
        })
      }

      const { slots, type } = viz

      // Procesar según tipo de visualización
      switch (type) {
        case "bar": {
          const axisSlot = slots.find((s) => s.role === "axis")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!axisSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const axisField = axisSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[axisField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            let aggregatedValue = 0
            switch (valueField.aggregation) {
              case "sum":
                aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
                break
              case "avg":
                aggregatedValue =
                  values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0) / values.length
                break
              case "count":
                aggregatedValue = values.length
                break
              case "min":
                aggregatedValue = Math.min(...values.map((v: any) => Number(v) || 0))
                break
              case "max":
                aggregatedValue = Math.max(...values.map((v: any) => Number(v) || 0))
                break
              default:
                aggregatedValue = values[0]
            }
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "axis", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
              type: "category",
              data: processedData.map((d) => d.name),
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            series: [
              {
                name: valueField.displayName,
                type: "bar",
                data: processedData.map((d) => d.value),
                itemStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
              },
            ],
            clickable: true,
            axisField: axisField.fieldName,
          }
        }

        case "line": {
          const axisSlot = slots.find((s) => s.role === "axis")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!axisSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const axisField = axisSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[axisField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            let aggregatedValue = 0
            switch (valueField.aggregation) {
              case "sum":
                aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
                break
              case "avg":
                aggregatedValue =
                  values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0) / values.length
                break
              case "count":
                aggregatedValue = values.length
                break
              case "min":
                aggregatedValue = Math.min(...values.map((v: any) => Number(v) || 0))
                break
              case "max":
                aggregatedValue = Math.max(...values.map((v: any) => Number(v) || 0))
                break
              default:
                aggregatedValue = values[0]
            }
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "axis", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
              type: "category",
              data: processedData.map((d) => d.name),
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            series: [
              {
                name: valueField.displayName,
                type: "line",
                data: processedData.map((d) => d.value),
                lineStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
                itemStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
              },
            ],
            clickable: true,
            axisField: axisField.fieldName,
          }
        }

        case "area": {
          const axisSlot = slots.find((s) => s.role === "axis")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!axisSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const axisField = axisSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[axisField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            const aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "axis", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
              type: "category",
              data: processedData.map((d) => d.name),
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            series: [
              {
                name: valueField.displayName,
                type: "line",
                data: processedData.map((d) => d.value),
                areaStyle: {
                  color: {
                    type: "linear",
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      { offset: 0, color: viz.formatOptions.colors.custom[0] || "#5470c6" },
                      { offset: 1, color: "rgba(84, 112, 198, 0.1)" },
                    ],
                  },
                },
                lineStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
              },
            ],
            clickable: true,
            axisField: axisField.fieldName,
          }
        }

        case "pie": {
          const legendSlot = slots.find((s) => s.role === "legend")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!legendSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const legendField = legendSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[legendField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            const aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "item", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            legend: { show: viz.formatOptions.legend.show, textStyle: { color: "#fff" } },
            series: [
              {
                name: valueField.displayName,
                type: "pie",
                radius: "70%",
                data: processedData,
                emphasis: {
                  itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
                },
              },
            ],
            color: viz.formatOptions.colors.custom,
            clickable: true,
            legendField: legendField.fieldName,
          }
        }

        case "donut": {
          const legendSlot = slots.find((s) => s.role === "legend")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!legendSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const legendField = legendSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[legendField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            const aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "item", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            legend: { show: viz.formatOptions.legend.show, textStyle: { color: "#fff" } },
            series: [
              {
                name: valueField.displayName,
                type: "pie",
                radius: ["40%", "70%"],
                data: processedData,
                emphasis: {
                  itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" },
                },
                itemStyle: { borderRadius: 10, borderColor: "#fff", borderWidth: 2 },
              },
            ],
            color: viz.formatOptions.colors.custom,
            clickable: true,
            legendField: legendField.fieldName,
          }
        }

        case "scatter": {
          const xSlot = slots.find((s) => s.role === "xaxis")
          const ySlot = slots.find((s) => s.role === "yaxis")
          const sizeSlot = slots.find((s) => s.role === "size")
          if (!xSlot?.fields[0] || !ySlot?.fields[0]) return null

          const xField = xSlot.fields[0]
          const yField = ySlot.fields[0]
          const sizeField = sizeSlot?.fields[0]

          const processedData = rows.map((row: any) => {
            const point = [Number(row[xField.fieldName]) || 0, Number(row[yField.fieldName]) || 0]
            if (sizeField) {
              point.push(Number(row[sizeField.fieldName]) || 10)
            }
            return point
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "item", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
              type: "value",
              name: xField.displayName,
              nameTextStyle: { color: "#fff" },
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            yAxis: {
              type: "value",
              name: yField.displayName,
              nameTextStyle: { color: "#fff" },
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            series: [
              {
                name: `${xField.displayName} vs ${yField.displayName}`,
                type: "scatter",
                data: processedData,
                symbolSize: sizeField ? (data: any) => Math.sqrt(data[2]) * 2 : 8,
                itemStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
              },
            ],
          }
        }

        case "gauge": {
          const valuesSlot = slots.find((s) => s.role === "values")
          const targetSlot = slots.find((s) => s.role === "target")
          if (!valuesSlot?.fields[0]) return null

          const valueField = valuesSlot.fields[0]
          const targetField = targetSlot?.fields[0]

          let value = 0
          let target = 100

          switch (valueField.aggregation) {
            case "sum":
              value = rows.reduce((sum, row) => sum + (Number(row[valueField.fieldName]) || 0), 0)
              break
            case "avg":
              value = rows.reduce((sum, row) => sum + (Number(row[valueField.fieldName]) || 0), 0) / rows.length
              break
            case "count":
              value = rows.length
              break
            default:
              value = rows[0]?.[valueField.fieldName] || 0
          }

          if (targetField) {
            target = rows[0]?.[targetField.fieldName] || 100
          }

          const percentage = Math.min(100, (value / target) * 100)

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            series: [
              {
                name: valueField.displayName,
                type: "gauge",
                min: 0,
                max: target,
                detail: { valueAnimation: true, formatter: "{value}", color: "#fff" },
                data: [{ value: value, name: valueField.displayName }],
                axisLine: {
                  lineStyle: {
                    width: 30,
                    color: [
                      [0.3, "#67e0e3"],
                      [0.7, "#37a2da"],
                      [1, "#fd666d"],
                    ],
                  },
                },
                pointer: { itemStyle: { color: "auto" } },
                axisTick: { distance: -30, length: 8, lineStyle: { color: "#fff", width: 2 } },
                splitLine: { distance: -30, length: 30, lineStyle: { color: "#fff", width: 4 } },
                axisLabel: { color: "auto", distance: 40, fontSize: 20 },
              },
            ],
          }
        }

        case "heatmap": {
          const xSlot = slots.find((s) => s.role === "xaxis")
          const ySlot = slots.find((s) => s.role === "yaxis")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!xSlot?.fields[0] || !ySlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const xField = xSlot.fields[0]
          const yField = ySlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const xCategories = [...new Set(rows.map((row) => row[xField.fieldName]))]
          const yCategories = [...new Set(rows.map((row) => row[yField.fieldName]))]

          const processedData = rows.map((row) => [
            xCategories.indexOf(row[xField.fieldName]),
            yCategories.indexOf(row[yField.fieldName]),
            Number(row[valueField.fieldName]) || 0,
          ])

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { position: "top", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { height: "50%", top: "10%" },
            xAxis: {
              type: "category",
              data: xCategories,
              splitArea: { show: true },
              axisLabel: { color: "#fff" },
            },
            yAxis: {
              type: "category",
              data: yCategories,
              splitArea: { show: true },
              axisLabel: { color: "#fff" },
            },
            visualMap: {
              min: 0,
              max: Math.max(...processedData.map((d) => d[2])),
              calculable: true,
              orient: "horizontal",
              left: "center",
              bottom: "15%",
              textStyle: { color: "#fff" },
            },
            series: [
              {
                name: valueField.displayName,
                type: "heatmap",
                data: processedData,
                label: { show: true, color: "#fff" },
                emphasis: { itemStyle: { shadowBlur: 10, shadowColor: "rgba(0, 0, 0, 0.5)" } },
              },
            ],
          }
        }

        case "radar": {
          const dimensionsSlot = slots.find((s) => s.role === "dimensions")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!dimensionsSlot?.fields || !valuesSlot?.fields[0]) return null

          const valueField = valuesSlot.fields[0]
          const dimensions = dimensionsSlot.fields.map((f) => f.fieldName)

          const radarData = dimensions.map((dim) => {
            const values = rows.map((row) => Number(row[dim]) || 0)
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length
            return { name: dim, max: Math.max(...values) * 1.2 }
          })

          const seriesData = [
            {
              value: dimensions.map((dim) => {
                const values = rows.map((row) => Number(row[dim]) || 0)
                return values.reduce((sum, val) => sum + val, 0) / values.length
              }),
              name: valueField.displayName,
            },
          ]

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            radar: {
              indicator: radarData,
              axisName: { color: "#fff" },
              splitLine: { lineStyle: { color: "#333" } },
              splitArea: { show: false },
            },
            series: [
              {
                name: valueField.displayName,
                type: "radar",
                data: seriesData,
                itemStyle: { color: viz.formatOptions.colors.custom[0] || "#5470c6" },
                areaStyle: { opacity: 0.3 },
              },
            ],
          }
        }

        case "funnel": {
          const stagesSlot = slots.find((s) => s.role === "stages")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!stagesSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const stageField = stagesSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const grouped = rows.reduce((acc: any, row: any) => {
            const key = row[stageField.fieldName]
            if (!acc[key]) acc[key] = []
            acc[key].push(row[valueField.fieldName])
            return acc
          }, {})

          const processedData = Object.entries(grouped).map(([key, values]: [string, any]) => {
            const aggregatedValue = values.reduce((sum: number, val: number) => sum + (Number(val) || 0), 0)
            return { name: key, value: aggregatedValue }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "item", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            series: [
              {
                name: valueField.displayName,
                type: "funnel",
                left: "10%",
                top: 60,
                width: "80%",
                height: "80%",
                data: processedData.sort((a, b) => b.value - a.value),
                label: { show: true, position: "inside", color: "#fff" },
                itemStyle: { borderColor: "#fff", borderWidth: 1 },
                emphasis: { label: { fontSize: 20 } },
              },
            ],
            color: viz.formatOptions.colors.custom,
          }
        }

        case "waterfall": {
          const categoriesSlot = slots.find((s) => s.role === "categories")
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!categoriesSlot?.fields[0] || !valuesSlot?.fields[0]) return null

          const categoryField = categoriesSlot.fields[0]
          const valueField = valuesSlot.fields[0]

          const processedData = rows.map((row) => ({
            name: row[categoryField.fieldName],
            value: Number(row[valueField.fieldName]) || 0,
          }))

          let cumulative = 0
          const waterfallData = processedData.map((item, index) => {
            const start = cumulative
            cumulative += item.value
            return {
              name: item.name,
              value: [start, cumulative],
              itemStyle: {
                color: item.value >= 0 ? "#5470c6" : "#ee6666",
              },
            }
          })

          return {
            title: {
              text: viz.formatOptions.title.show ? viz.formatOptions.title.text : "",
              textStyle: { color: viz.formatOptions.title.color, fontSize: viz.formatOptions.title.fontSize },
            },
            tooltip: { trigger: "axis", backgroundColor: "rgba(0,0,0,0.8)", textStyle: { color: "#fff" } },
            grid: { left: "3%", right: "4%", bottom: "3%", containLabel: true },
            xAxis: {
              type: "category",
              data: processedData.map((d) => d.name),
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
            },
            yAxis: {
              type: "value",
              axisLabel: { color: "#fff" },
              axisLine: { lineStyle: { color: "#fff" } },
              splitLine: { lineStyle: { color: "#333" } },
            },
            series: [
              {
                name: valueField.displayName,
                type: "bar",
                stack: "waterfall",
                data: waterfallData,
                label: { show: true, position: "top", color: "#fff" },
              },
            ],
          }
        }

        case "table": {
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!valuesSlot?.fields || valuesSlot.fields.length === 0) return null

          return {
            type: "table",
            data: rows.slice(0, 10),
            columns: valuesSlot.fields.map((field) => field.fieldName),
          }
        }

        case "kpi": {
          const valuesSlot = slots.find((s) => s.role === "values")
          if (!valuesSlot?.fields[0]) return null

          const valueField = valuesSlot.fields[0]
          let value = 0

          switch (valueField.aggregation) {
            case "sum":
              value = rows.reduce((sum, row) => sum + (Number(row[valueField.fieldName]) || 0), 0)
              break
            case "avg":
              value = rows.reduce((sum, row) => sum + (Number(row[valueField.fieldName]) || 0), 0) / rows.length
              break
            case "count":
              value = rows.length
              break
            default:
              value = rows[0]?.[valueField.fieldName] || 0
          }

          return {
            type: "kpi",
            value: value,
            title: valueField.displayName,
            format: valueField.dataType === "currency" ? "currency" : "number",
          }
        }

        case "slicer": {
          const fieldSlot = slots.find((s) => s.role === "field")
          if (!fieldSlot?.fields[0]) return null

          const field = fieldSlot.fields[0]
          const uniqueValues = [...new Set(rows.map((row) => row[field.fieldName]))].filter(
            (v) => v !== null && v !== undefined,
          )

          return {
            type: "slicer",
            field: field.fieldName,
            values: uniqueValues,
            selectedValue: allFilters[field.fieldName] || null,
          }
        }

        default:
          return null
      }
    }, [viz, tables, globalFilters])

    useEffect(() => {
      if (!chartRef.current || !processVisualizationData) return

      if (viz.type === "kpi") {
        const kpiData = processVisualizationData as { type: string; value: number; title: string; format: string }
        if (chartRef.current) {
          const formattedValue =
            kpiData.format === "currency"
              ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(kpiData.value)
              : new Intl.NumberFormat("es-ES").format(kpiData.value)

          chartRef.current.innerHTML = `
          <div class="flex flex-col items-center justify-center h-full text-white">
            <div class="text-3xl font-bold mb-2">${formattedValue}</div>
            <div class="text-sm text-white/70">${kpiData.title}</div>
          </div>
        `
        }
      } else if (viz.type === "table") {
        const tableData = processVisualizationData as { type: string; data: any[]; columns: string[] }
        if (chartRef.current) {
          chartRef.current.innerHTML = `
          <div class="overflow-auto h-full">
            <table class="w-full text-sm text-white/80">
              <thead>
                <tr class="bg-[#250d46]/80">
                  ${tableData.columns.map((col) => `<th class="p-2 text-left">${col}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${tableData.data
                  .map(
                    (row) => `
                  <tr class="border-b border-[#250d46]/20">
                    ${tableData.columns.map((col) => `<td class="p-2">${row[col] || "-"}</td>`).join("")}
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `
        }
      } else if (viz.type === "slicer") {
        const slicerData = processVisualizationData as {
          type: string
          field: string
          values: any[]
          selectedValue: any
        }
        if (chartRef.current) {
          chartRef.current.innerHTML = `
          <div class="p-2">
            <h4 class="text-sm font-medium text-white mb-2">${slicerData.field}</h4>
            <div class="space-y-1 max-h-40 overflow-y-auto">
              ${slicerData.values
                .map(
                  (value) => `
                <div class="flex items-center space-x-2 p-1 rounded hover:bg-[#250d46]/60 cursor-pointer ${
                  value === slicerData.selectedValue ? "bg-[#250d46]/80" : ""
                }" 
                     onclick="window.handleSlicerClick('${slicerData.field}', '${value}', ${viz.id})">
                  <div class="w-3 h-3 border border-white/40 rounded ${
                    value === slicerData.selectedValue ? "bg-white" : ""
                  }"></div>
                  <span class="text-white/90 text-sm">${value}</span>
                </div>
              `,
                )
                .join("")}
            </div>
          </div>
        `
          ;(window as any).handleSlicerClick = (field: string, value: any, vizId: number) => {
            applyCrossFilter(vizId, field, value)
          }
        }
      } else {
        // Renderizar gráfico ECharts
        if (!chartInstanceRef.current) {
          chartInstanceRef.current = echarts.init(chartRef.current, "dark")
        }

        const chart = chartInstanceRef.current

        // Resize chart when container size changes
        chart.resize()

        chart.setOption(processVisualizationData, true)

        chart.off("click")
        chart.on("click", (params: any) => {
          if ((processVisualizationData as any).clickable) {
            if ((processVisualizationData as any).axisField) {
              applyCrossFilter(viz.id, (processVisualizationData as any).axisField, params.name)
            } else if ((processVisualizationData as any).legendField) {
              applyCrossFilter(viz.id, (processVisualizationData as any).legendField, params.name)
            }
          }
        })
      }

      return () => {
        if (chartInstanceRef.current && (viz.type === "kpi" || viz.type === "table" || viz.type === "slicer")) {
          chartInstanceRef.current.dispose()
          chartInstanceRef.current = null
        }
      }
    }, [processVisualizationData, viz.id, viz.type, applyCrossFilter])

    // Resize chart when visualization size changes
    useEffect(() => {
      if (chartInstanceRef.current) {
        const resizeObserver = new ResizeObserver(() => {
          chartInstanceRef.current?.resize()
        })

        if (chartRef.current) {
          resizeObserver.observe(chartRef.current)
        }

        return () => {
          resizeObserver.disconnect()
        }
      }
    }, [viz.size])

    useEffect(() => {
      return () => {
        if (chartInstanceRef.current) {
          chartInstanceRef.current.dispose()
          chartInstanceRef.current = null
        }
      }
    }, [])

    return <div ref={chartRef} className="w-full h-full" />
  },
)

EChartsChart.displayName = "EChartsChart"

export default EChartsChart
