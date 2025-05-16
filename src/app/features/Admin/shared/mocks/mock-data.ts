import { ChartDataSet } from '../models/bar-chart.model';

// Mock data for chart display with higher values for better visibility
export const MOCK_CHART_DATA: Record<string, ChartDataSet> = {
  Weekly: {
    data: [
      { day: 'Monday', value1: 18, value2: 12 },
      { day: 'Tuesday', value1: 21, value2: 15 },
      { day: 'Wednesday', value1: 24, value2: 18 },
      { day: 'Thursday', value1: 27, value2: 21 },
      { day: 'Friday', value1: 24, value2: 18 },
    ],
    timeLabels: ['6am', '8am', '10am', '12pm', '2pm', '4pm'],
    startDate: new Date(2023, 10, 14),
    endDate: new Date(2023, 10, 18),
  },
  Monthly: {
    data: [
      { day: 'Q1', value1: 24, value2: 18 },
      { day: 'Q2', value1: 28, value2: 22 },
      { day: 'Q3', value1: 30, value2: 25 },
      { day: 'Q4', value1: 32, value2: 26 },
    ],
    timeLabels: ['6am', '8am', '10am', '12pm', '2pm', '4pm'],
    startDate: new Date(2023, 10, 1), // November 1, 2023
    endDate: new Date(2023, 10, 30), // November 30, 2023
  },
  Yearly: {
    data: [
      { day: 'Jan', value1: 15, value2: 12 },
      { day: 'Feb', value1: 18, value2: 15 },
      { day: 'Mar', value1: 21, value2: 18 },
      { day: 'Apr', value1: 24, value2: 21 },
      { day: 'May', value1: 27, value2: 24 },
      { day: 'Jun', value1: 30, value2: 27 },
      { day: 'Jul', value1: 27, value2: 24 },
      { day: 'Aug', value1: 24, value2: 21 },
      { day: 'Sep', value1: 21, value2: 18 },
      { day: 'Oct', value1: 18, value2: 15 },
      { day: 'Nov', value1: 15, value2: 12 },
      { day: 'Dec', value1: 12, value2: 9 },
    ],
    timeLabels: ['6am', '8am', '10am', '12pm', '2pm', '4pm'],
    startDate: new Date(2023, 0, 1), // January 1, 2023
    endDate: new Date(2023, 11, 31), // December 31, 2023
  },
};
