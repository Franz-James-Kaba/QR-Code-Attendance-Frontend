export interface ChartDataPoint {
  day: string;
  value1: number;
  value2: number;
}

export interface ChartDataSet {
  data: ChartDataPoint[];
  startDate?: Date;
  endDate?: Date;
  timeLabels?: string[];
  label1?: string;
  label2?: string;
  color1?: string;
  color2?: string;
}

export type TimeRange = 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
