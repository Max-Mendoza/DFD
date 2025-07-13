import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
export type DataChart = {
    title: { text: string},
    xAxis: {
        type: string,
        data: string[]
    },
    yAxis: {
        type: string,
    },
    series:
    Array<{
        type: "bar" | "line";
        data: number[];
    }>;

}
interface ChartProp {
    data: DataChart
}
export default function Chart({ data }: ChartProp) {
    const chartRef = useRef(null)
    console.log("Tipo de data:", typeof data)
    console.log("Contenido de data:", data)
    
    useEffect(() => {
        const chart = echarts.init(chartRef.current)
        chart.setOption(data)
        return () => chart.dispose()

    }, [data])

    return <div ref={chartRef} style={{ width: '100%', height: 400 }} />;

}