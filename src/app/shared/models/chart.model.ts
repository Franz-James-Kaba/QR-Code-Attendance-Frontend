/**
 * Unified Chart Model
 * A flexible model that supports multiple chart types and configurations
 */

export interface ChartDataPoint {
  label: string; // X-axis label (e.g., day, category)
  values: number[]; // Array of values for each series
  tooltips?: string[]; // Optional custom tooltips for each value
}

export type ChartType = 'bar' | 'line' | 'pie';
export type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';

export interface ChartSeries {
  name: string;
  color?: string;
}

export interface ChartDataSet {
  data: ChartDataPoint[];
  series: ChartSeries[];
  startDate?: Date;
  endDate?: Date;
  yAxisLabels?: string[];
  showLegend?: boolean;
  animated?: boolean;
  type?: ChartType;
}

export interface ChartOptions {
  height?: number;
  showTimeRangeSelector?: boolean;
  defaultTimeRange?: TimeRange;
  responsive?: boolean;
  tooltipEnabled?: boolean;
  animationDuration?: number;
  barWidth?: number;
  barGap?: number;
  lineThickness?: number;
  pointRadius?: number;
  tooltipFollowCursor?: boolean;
}
