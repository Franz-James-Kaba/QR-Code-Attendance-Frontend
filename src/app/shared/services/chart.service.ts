import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { ChartDataPoint, ChartDataSet, ChartType, TimeRange } from '@shared/models/chart.model';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';

import { environment } from '../../../environments/environment';


/**
 * Service to handle chart data operations
 * In a real application, this would connect to backend APIs
 */
@Injectable({
  providedIn: 'root'
})
export class ChartService {
  private cachedData: Record<string, { data: ChartDataSet, timestamp: number }> = {};
  private readonly http = inject(HttpClient)

  /**
   * Gets chart data for a specific data source and time range
   * @param source Identifies the data source (e.g., 'attendance', 'staying-time')
   * @param timeRange The time range to fetch data for
   * @param chartType The type of chart to generate data for
   */
  getChartData(source: string, timeRange: TimeRange, chartType: ChartType = 'bar'): Observable<ChartDataSet> {
    const cacheKey = `${source}_${timeRange}_${chartType}`;
    const now = Date.now();

    // Check if we have valid cached data
    if (this.cachedData[cacheKey] &&
        (now - this.cachedData[cacheKey].timestamp) < environment.charts.cacheExpiration) {
      return of(this.cachedData[cacheKey].data);
    }

    // Use mock data in development if enabled
    if (!environment.production || environment.charts.enableMockData) {
      return this.fetchMockData(source, timeRange, chartType).pipe(
        delay(500), // Simulate network delay
        map(data => {
          // Store in cache with timestamp
          this.cachedData[cacheKey] = { data, timestamp: now };
          return data;
        }),
        catchError(error => {
          console.error(`Error fetching mock chart data for ${source}:`, error);
          return of(this.getEmptyDataSet(chartType));
        })
      );
    }

    // Use real API in production
    return this.fetchFromApi(source, timeRange, chartType).pipe(
      map(data => {
        // Store in cache with timestamp
        this.cachedData[cacheKey] = { data, timestamp: now };
        return data;
      }),
      catchError(error => {
        console.error(`Error fetching chart data from API for ${source}:`, error);
        return of(this.getEmptyDataSet(chartType));
      })
    );
  }

  /**
   * Fetches data from the API in production
   */
  private fetchFromApi(source: string, timeRange: TimeRange, chartType: ChartType): Observable<ChartDataSet> {
    const endpoint = `${environment.apiUrl}/charts/${source}?timeRange=${timeRange}`;
    return this.http.get<any>(endpoint).pipe(
      map(response => this.mapApiResponseToChartData(response, chartType))
    );
  }

  /**
   * Maps API response to our chart data format
   */
  private mapApiResponseToChartData(apiResponse: any, chartType: ChartType): ChartDataSet {
    // This would be implemented based on your API structure
    // Below is just a placeholder implementation
    try {
      const chartData: ChartDataPoint[] = apiResponse.data.map((item: any) => ({
        label: item.label,
        values: item.values
      }));

      return {
        data: chartData,
        series: apiResponse.series,
        startDate: new Date(apiResponse.startDate),
        endDate: new Date(apiResponse.endDate),
        yAxisLabels: apiResponse.yAxisLabels,
        showLegend: true,
        type: chartType
      };
    } catch (e) {
      console.error('Error mapping API response to chart data:', e);
      return this.getEmptyDataSet(chartType);
    }
  }

  /**
   * Transforms legacy data format to the unified chart data format
   * @param legacyData The legacy data in the old format
   * @param chartType The target chart type
   */
  transformLegacyData(legacyData: any, chartType: ChartType = 'bar'): ChartDataSet {
    // Handle data in the format from the previous implementation
    if (!legacyData?.data) {
      return this.getEmptyDataSet(chartType);
    }

    try {
      const transformedData: ChartDataPoint[] = legacyData.data.map((item: any) => ({
        label: item.day,
        values: [item.value1, item.value2],
        tooltips: [`${item.value1}`, `${item.value2}`]
      }));

      return {
        data: transformedData,
        series: [
          { name: legacyData.label1 || 'Series 1', color: legacyData.color1 || '#3b82f6' },
          { name: legacyData.label2 || 'Series 2', color: legacyData.color2 || '#1f2937' }
        ],
        startDate: legacyData.startDate || new Date(),
        endDate: legacyData.endDate || new Date(),
        yAxisLabels: legacyData.timeLabels || [],
        showLegend: true,
        animated: true,
        type: chartType
      };
    } catch (error) {
      console.error('Error transforming legacy data:', error);
      return this.getEmptyDataSet(chartType);
    }
  }

  /**
   * Creates an empty data set for the specified chart type
   */
  private getEmptyDataSet(chartType: ChartType): ChartDataSet {
    return {
      data: [],
      series: [
        { name: 'Series 1', color: '#3b82f6' },
        { name: 'Series 2', color: '#1f2937' }
      ],
      startDate: new Date(),
      endDate: new Date(),
      showLegend: true,
      type: chartType
    };
  }

  /**
   * Fetches mock data for development and testing
   */
  private fetchMockData(source: string, timeRange: TimeRange, chartType: ChartType): Observable<ChartDataSet> {
    // In a real implementation, this would make API calls to your backend
    let mockData: ChartDataSet;

    if (source === 'attendance') {
      mockData = this.getMockAttendanceData(timeRange);
    } else if (source === 'staying-time') {
      mockData = this.getMockStayingTimeData(timeRange);
    } else if (source === 'program-distribution') {
      mockData = this.getMockProgramDistributionData();
    } else {
      mockData = this.getEmptyDataSet(chartType);
    }

    mockData.type = chartType;
    return of(mockData);
  }

  /**
   * Generate mock attendance data for the chart
   */
  private getMockAttendanceData(timeRange: TimeRange): ChartDataSet {
    let data: ChartDataPoint[] = [];
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
    let yAxisLabels: string[] = [];
    let maxValue = 0;

    // Generate different data sets based on time range
    if (timeRange === 'Daily') {
      startDate = new Date(currentDate);
      endDate = new Date(currentDate);

      data = [
        { label: '6:00 AM', values: [8, 2], tooltips: ['8 NSPs', '2 Facilitators'] },
        { label: '7:00 AM', values: [15, 5], tooltips: ['15 NSPs', '5 Facilitators'] },
        { label: '8:00 AM', values: [42, 12], tooltips: ['42 NSPs', '12 Facilitators'] },
        { label: '9:00 AM', values: [25, 8], tooltips: ['25 NSPs', '8 Facilitators'] },
        { label: '10:00 AM', values: [10, 4], tooltips: ['10 NSPs', '4 Facilitators'] },
        { label: '11:00 AM', values: [5, 2], tooltips: ['5 NSPs', '2 Facilitators'] }
      ];

      // Find maximum value for y-axis scaling
      data.forEach(item => {
        const sum = item.values.reduce((a, b) => a + b, 0);
        maxValue = Math.max(maxValue, sum);
      });

      // Create dynamic y-axis labels starting from 0
      const numberOfSteps = 5;
      const step = Math.ceil(maxValue / numberOfSteps);
      yAxisLabels = Array.from({length: numberOfSteps + 1}, (_, i) => (i * step).toString());

    } else if (timeRange === 'Weekly') {
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      data = [
        { label: 'Mon', values: [65, 25], tooltips: ['65 NSPs', '25 Facilitators'] },
        { label: 'Tue', values: [78, 32], tooltips: ['78 NSPs', '32 Facilitators'] },
        { label: 'Wed', values: [82, 38], tooltips: ['82 NSPs', '38 Facilitators'] },
        { label: 'Thu', values: [75, 30], tooltips: ['75 NSPs', '30 Facilitators'] },
        { label: 'Fri', values: [70, 26], tooltips: ['70 NSPs', '26 Facilitators'] }
      ];

      // Find maximum value for y-axis scaling
      data.forEach(item => {
        const sum = item.values.reduce((a, b) => a + b, 0);
        maxValue = Math.max(maxValue, sum);
      });

      // Create dynamic y-axis labels starting from 0
      const numberOfSteps = 5;
      const step = Math.ceil(maxValue / numberOfSteps);
      yAxisLabels = Array.from({length: numberOfSteps + 1}, (_, i) => (i * step).toString());

    } else if (timeRange === 'Monthly') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      data = [
        { label: 'Week 1', values: [320, 125], tooltips: ['320 NSPs', '125 Facilitators'] },
        { label: 'Week 2', values: [350, 138], tooltips: ['350 NSPs', '138 Facilitators'] },
        { label: 'Week 3', values: [380, 145], tooltips: ['380 NSPs', '145 Facilitators'] },
        { label: 'Week 4', values: [365, 132], tooltips: ['365 NSPs', '132 Facilitators'] }
      ];

      // Find maximum value for y-axis scaling
      data.forEach(item => {
        const sum = item.values.reduce((a, b) => a + b, 0);
        maxValue = Math.max(maxValue, sum);
      });

      // Create dynamic y-axis labels starting from 0
      const numberOfSteps = 5;
      const step = Math.ceil(maxValue / numberOfSteps);
      yAxisLabels = Array.from({length: numberOfSteps + 1}, (_, i) => (i * step).toString());

    } else {
      // Yearly data
      startDate = new Date(currentDate.getFullYear(), 0, 1);
      endDate = new Date(currentDate.getFullYear(), 11, 31);

      data = [
        { label: 'Jan', values: [750, 280], tooltips: ['750 NSPs', '280 Facilitators'] },
        { label: 'Feb', values: [800, 310], tooltips: ['800 NSPs', '310 Facilitators'] },
        { label: 'Mar', values: [820, 325], tooltips: ['820 NSPs', '325 Facilitators'] },
        { label: 'Apr', values: [780, 300], tooltips: ['780 NSPs', '300 Facilitators'] },
        { label: 'May', values: [790, 305], tooltips: ['790 NSPs', '305 Facilitators'] },
        { label: 'Jun', values: [830, 320], tooltips: ['830 NSPs', '320 Facilitators'] },
        { label: 'Jul', values: [850, 335], tooltips: ['850 NSPs', '335 Facilitators'] },
        { label: 'Aug', values: [810, 315], tooltips: ['810 NSPs', '315 Facilitators'] },
        { label: 'Sep', values: [795, 305], tooltips: ['795 NSPs', '305 Facilitators'] },
        { label: 'Oct', values: [820, 325], tooltips: ['820 NSPs', '325 Facilitators'] },
        { label: 'Nov', values: [840, 330], tooltips: ['840 NSPs', '330 Facilitators'] },
        { label: 'Dec', values: [760, 290], tooltips: ['760 NSPs', '290 Facilitators'] }
      ];

      // Find maximum value for y-axis scaling
      data.forEach(item => {
        const sum = item.values.reduce((a, b) => a + b, 0);
        maxValue = Math.max(maxValue, sum);
      });

      // Create dynamic y-axis labels starting from 0
      const numberOfSteps = 5;
      const step = Math.ceil(maxValue / numberOfSteps);
      yAxisLabels = Array.from({length: numberOfSteps + 1}, (_, i) => (i * step).toString());
    }

    return {
      data,
      series: [
        { name: 'NSPs', color: '#3b82f6' },
        { name: 'Facilitators', color: '#1f2937' }
      ],
      startDate,
      endDate,
      yAxisLabels,
      showLegend: true,
      animated: true,
      type: 'bar'
    };
  }

  /**
   * Generate mock staying time data for the chart
   */
  private getMockStayingTimeData(timeRange: TimeRange): ChartDataSet {
    let data: ChartDataPoint[] = [];
    const currentDate = new Date();
    let startDate: Date;
    let endDate: Date;
    // Update y-axis labels to represent hours (0-8 hours)
    const yAxisLabels: string[] = ['0h', '1h', '2h', '3h', '4h', '5h', '6h', '7h', '8h'];

    if (timeRange === 'Weekly') {
      startDate = new Date('2025-02-17');
      endDate = new Date('2025-02-21');

      data = [
        { label: 'Mon', values: [4.5, 0.8], tooltips: ['4.5 hours avg stay', '±0.8h variation'] },
        { label: 'Tue', values: [5.2, 1.1], tooltips: ['5.2 hours avg stay', '±1.1h variation'] },
        { label: 'Wed', values: [4.8, 0.7], tooltips: ['4.8 hours avg stay', '±0.7h variation'] },
        { label: 'Thu', values: [5.5, 1.2], tooltips: ['5.5 hours avg stay', '±1.2h variation'] },
        { label: 'Fri', values: [4.2, 0.9], tooltips: ['4.2 hours avg stay', '±0.9h variation'] }
      ];
    } else if (timeRange === 'Monthly') {
      startDate = new Date('2025-02-01');
      endDate = new Date('2025-02-28');

      data = [
        { label: 'Week 1', values: [4.7, 0.9], tooltips: ['4.7 hours avg stay', '±0.9h variation'] },
        { label: 'Week 2', values: [5.1, 1.0], tooltips: ['5.1 hours avg stay', '±1.0h variation'] },
        { label: 'Week 3', values: [4.9, 0.8], tooltips: ['4.9 hours avg stay', '±0.8h variation'] },
        { label: 'Week 4', values: [5.3, 1.1], tooltips: ['5.3 hours avg stay', '±1.1h variation'] }
      ];
    } else {
      startDate = new Date('2025-01-01');
      endDate = new Date('2025-12-31');

      data = [
        { label: 'Jan', values: [4.5, 0.8], tooltips: ['4.5 hours avg stay', '±0.8h variation'] },
        { label: 'Feb', values: [4.7, 0.9], tooltips: ['4.7 hours avg stay', '±0.9h variation'] },
        { label: 'Mar', values: [5.0, 1.0], tooltips: ['5.0 hours avg stay', '±1.0h variation'] },
        { label: 'Apr', values: [5.2, 1.1], tooltips: ['5.2 hours avg stay', '±1.1h variation'] },
        { label: 'May', values: [5.5, 1.2], tooltips: ['5.5 hours avg stay', '±1.2h variation'] },
        { label: 'Jun', values: [5.3, 1.1], tooltips: ['5.3 hours avg stay', '±1.1h variation'] },
        { label: 'Jul', values: [5.1, 1.0], tooltips: ['5.1 hours avg stay', '±1.0h variation'] },
        { label: 'Aug', values: [4.9, 0.9], tooltips: ['4.9 hours avg stay', '±0.9h variation'] },
        { label: 'Sep', values: [5.0, 1.0], tooltips: ['5.0 hours avg stay', '±1.0h variation'] },
        { label: 'Oct', values: [5.2, 1.1], tooltips: ['5.2 hours avg stay', '±1.1h variation'] },
        { label: 'Nov', values: [4.8, 0.9], tooltips: ['4.8 hours avg stay', '±0.9h variation'] },
        { label: 'Dec', values: [4.6, 0.8], tooltips: ['4.6 hours avg stay', '±0.8h variation'] }
      ];
    }

    return {
      data,
      series: [
        { name: 'Average stay (hours)', color: '#3b82f6' },
        { name: 'Variation (±hours)', color: '#1f2937' }
      ],
      startDate,
      endDate,
      yAxisLabels,
      showLegend: true,
      animated: true,
      type: 'line'
    };
  }

  /**
   * Generate mock program distribution data for pie chart
   */
  private getMockProgramDistributionData(): ChartDataSet {
    const currentDate = new Date();

    // Total participants
    const totalParticipants = 200;

    // Distribution between NSPs and Facilitators
    const nspCount = 150;  // 75% of total
    const facilitatorCount = 50;  // 25% of total

    const data: ChartDataPoint[] = [
      { label: 'NSPs', values: [nspCount], tooltips: [`${nspCount} NSPs (${(nspCount/totalParticipants*100).toFixed(0)}%)`] },
      { label: 'Facilitators', values: [facilitatorCount], tooltips: [`${facilitatorCount} Facilitators (${(facilitatorCount/totalParticipants*100).toFixed(0)}%)`] }
    ];

    return {
      data,
      series: [
        { name: 'NSPs', color: '#3b82f6' },
        { name: 'Facilitators', color: '#1f2937' }
      ],
      startDate: currentDate,
      endDate: currentDate,
      showLegend: true,
      animated: true,
      type: 'pie'
    };
  }
}
