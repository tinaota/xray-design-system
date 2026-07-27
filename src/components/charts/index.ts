/*
 * Chart barrel.
 *
 * The five ECharts-based charts at the bottom were previously absent from this
 * file, so they could not be imported from `@/components` at all — callers had
 * to reach into the file path directly, and more often simply never found them.
 */

// Lightweight hand-rolled SVG charts.
export { FacilityRevenueBar } from "./FacilityRevenueBar";
export { ServiceSplitDonut } from "./ServiceSplitDonut";
export { RevenueAreaChart } from "./RevenueAreaChart";
export { DailyJobVolumeChart } from "./DailyJobVolumeChart";
export { ProcedureDistributionDonut } from "./ProcedureDistributionDonut";

// Metric / widget cards.
export { RealtimeCounterCard } from "./RealtimeCounterCard";
export { CodeScrubberWidget } from "./CodeScrubberWidget";
export { ResponseTimeCard } from "./ResponseTimeCard";
export { MapDensityCard } from "./MapDensityCard";

// ECharts-based charts. Each is "use client" and wraps its own
// `dynamic(() => import("echarts-for-react"), { ssr: false })`, so re-exporting
// them here does not pull ECharts into a server bundle.
export { OrderBarChart } from "./OrderBarChart";
export { RevenueLineChart } from "./RevenueLineChart";
export { CPTDonutChart } from "./CPTDonutChart";
export { CollectionGauge } from "./CollectionGauge";
export { TechnicianActivityChart } from "./TechnicianActivityChart";
