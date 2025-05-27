import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { ChartDataPoint, ChartDataSet, ChartType, TimeRange } from '@shared/models/chart.model';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';


/**
 * Service to handle chart data operations
 * In a real application, this would connect to backend APIs
 */
@Injectable({
  providedIn: 'root',
})
export class ChartService {
  private cachedData: Record<string, { data: ChartDataSet; timestamp: number }> = {};
  private readonly http = inject(HttpClient);

  /**
   * Gets chart data for a specific data source and time range
   * @param source Identifies the data source (e.g., 'attendance', 'staying-time')
   * @param timeRange The time range to fetch data for
   * @param chartType The type of chart to generate data for
   */
  getChartData(
    source: string,
    timeRange: TimeRange,
    chartType: ChartType = 'bar'
  ): Observable<ChartDataSet> {
    const cacheKey = `${source}_${timeRange}_${chartType}`;
    const now = Date.now();

    // Check if we have valid cached data
    if (
      this.cachedData[cacheKey] &&
      now - this.cachedData[cacheKey].timestamp < environment.charts.cacheExpiration
    ) {
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
  private fetchFromApi(
    source: string,
    timeRange: TimeRange,
    chartType: ChartType
  ): Observable<ChartDataSet> {
    const endpoint = `${environment.apiUrl}/charts/${source}?timeRange=${timeRange}`;
    return this.http
      .get<any>(endpoint)
      .pipe(map(response => this.mapApiResponseToChartData(response, chartType)));
  }

  /**
   * Maps API response to our chart data format
   */
  private mapApiResponseToChartData(apiResponse: any, chartType: ChartType): ChartDataSet {
    // This would be implemented based on your API structure
    // Below is just a placeholder implementation
    try {
      interface ApiResponseItem {
        label: string;
        values: number[];
        tooltips?: string[];
      }

      const chartData: ChartDataPoint[] = apiResponse.data.map((item: ApiResponseItem) => ({
        label: item.label,
        values: item.values,
      }));

      return {
        data: chartData,
        series: apiResponse.series,
        startDate: new Date(apiResponse.startDate),
        endDate: new Date(apiResponse.endDate),
        yAxisLabels: apiResponse.yAxisLabels,
        showLegend: true,
        type: chartType,
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
        tooltips: [`${item.value1}`, `${item.value2}`],
      }));

      return {
        data: transformedData,
        series: [
          { name: legacyData.label1 ?? 'Series 1', color: legacyData.color1 ?? '#065186' },
          { name: legacyData.label2 ?? 'Series 2', color: legacyData.color2 ?? '#1f2937' },
        ],
        startDate: legacyData.startDate ?? new Date(),
        endDate: legacyData.endDate ?? new Date(),
        yAxisLabels: legacyData.timeLabels ?? [],
        showLegend: true,
        animated: true,
        type: chartType,
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
        { name: 'Series 1', color: '#065186' },
        { name: 'Series 2', color: '#1f2937' },
      ],
      startDate: new Date(),
      endDate: new Date(),
      showLegend: true,
      type: chartType,
    };
  }

  /**
   * Fetches mock data for development and testing
   */
  private fetchMockData(
    source: string,
    timeRange: TimeRange,
    chartType: ChartType
  ): Observable<ChartDataSet> {
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

    if (timeRange === 'Weekly') {
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      data = [
        { label: 'Mon', values: [65, 25], tooltips: ['65 NSPs', '25 Facilitators'] },
        { label: 'Tue', values: [78, 32], tooltips: ['78 NSPs', '32 Facilitators'] },
        { label: 'Wed', values: [82, 38], tooltips: ['82 NSPs', '38 Facilitators'] },
        { label: 'Thu', values: [75, 30], tooltips: ['75 NSPs', '30 Facilitators'] },
        { label: 'Fri', values: [70, 26], tooltips: ['70 NSPs', '26 Facilitators'] },
      ];
    } else if (timeRange === 'Monthly') {
      startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      data = [
        { label: 'Week 1', values: [320, 125], tooltips: ['320 NSPs', '125 Facilitators'] },
        { label: 'Week 2', values: [350, 138], tooltips: ['350 NSPs', '138 Facilitators'] },
        { label: 'Week 3', values: [380, 145], tooltips: ['380 NSPs', '145 Facilitators'] },
        { label: 'Week 4', values: [365, 132], tooltips: ['365 NSPs', '132 Facilitators'] },
      ];
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
        { label: 'Dec', values: [760, 290], tooltips: ['760 NSPs', '290 Facilitators'] },
      ];
    }

    // Calculate y-axis labels based on the maximum value
    data.forEach(item => {
      const sum = item.values.reduce((a, b) => a + b, 0);
      maxValue = Math.max(maxValue, sum);
    });

    // Create dynamic y-axis labels starting from 0
    const numberOfSteps = 5;
    const step = Math.ceil(maxValue / numberOfSteps);
    yAxisLabels = Array.from({ length: numberOfSteps + 1 }, (_, i) => (i * step).toString());

    return {
      data,
      series: [
        { name: 'NSPs', color: '#065186' },
        { name: 'Facilitators', color: '#1f2937' },
      ],
      startDate,
      endDate,
      yAxisLabels,
      showLegend: true,
      animated: true,
      type: 'bar',
    };
  }

  /**
   * Generate mock staying time data for the chart
   */  private getMockStayingTimeData(timeRange: TimeRange): ChartDataSet {
    let data: ChartDataPoint[] = [];
    let startDate: Date;
    let endDate: Date;
    // Update y-axis labels to represent times from 7 AM to 6 PM
    const yAxisLabels: string[] = ['7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
                                 '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

    if (timeRange === 'Weekly') {
      startDate = new Date('2025-02-17');
      endDate = new Date('2025-02-21');

      data = [
        { label: 'Mon', values: [9.5, 0.8], tooltips: ['Avg: 9:30 AM', '±48min variation'] },
        { label: 'Tue', values: [8.8, 0.5], tooltips: ['Avg: 8:48 AM', '±30min variation'] },
        { label: 'Wed', values: [9.2, 0.7], tooltips: ['Avg: 9:12 AM', '±42min variation'] },
        { label: 'Thu', values: [8.5, 0.4], tooltips: ['Avg: 8:30 AM', '±24min variation'] },
        { label: 'Fri', values: [9.0, 0.6], tooltips: ['Avg: 9:00 AM', '±36min variation'] },
      ];    } else if (timeRange === 'Monthly') {
      startDate = new Date('2025-02-01');
      endDate = new Date('2025-02-28');

      data = [
        {
          label: 'Week 1',
          values: [9.2, 0.7],
          tooltips: ['Avg: 9:12 AM', '±42min variation'],
        },
        {
          label: 'Week 2',
          values: [8.8, 0.5],
          tooltips: ['Avg: 8:48 AM', '±30min variation'],
        },
        {
          label: 'Week 3',
          values: [9.0, 0.6],
          tooltips: ['Avg: 9:00 AM', '±36min variation'],
        },
        {
          label: 'Week 4',
          values: [8.5, 0.4],
          tooltips: ['Avg: 8:30 AM', '±24min variation'],
        },
      ];
    } else {
      startDate = new Date('2025-01-01');
      endDate = new Date('2025-12-31');

      data = [
        { label: 'Jan', values: [9.3, 0.7], tooltips: ['Avg: 9:18 AM', '±42min variation'] },
        { label: 'Feb', values: [9.0, 0.6], tooltips: ['Avg: 9:00 AM', '±36min variation'] },
        { label: 'Mar', values: [8.8, 0.5], tooltips: ['Avg: 8:48 AM', '±30min variation'] },
        { label: 'Apr', values: [8.5, 0.4], tooltips: ['Avg: 8:30 AM', '±24min variation'] },
        { label: 'May', values: [8.7, 0.5], tooltips: ['Avg: 8:42 AM', '±30min variation'] },
        { label: 'Jun', values: [9.0, 0.6], tooltips: ['Avg: 9:00 AM', '±36min variation'] },
        { label: 'Jul', values: [9.2, 0.7], tooltips: ['Avg: 9:12 AM', '±42min variation'] },
        { label: 'Aug', values: [9.1, 0.6], tooltips: ['Avg: 9:06 AM', '±36min variation'] },
        { label: 'Sep', values: [8.9, 0.5], tooltips: ['Avg: 8:54 AM', '±30min variation'] },
        { label: 'Oct', values: [8.7, 0.4], tooltips: ['Avg: 8:42 AM', '±24min variation'] },
        { label: 'Nov', values: [8.8, 0.5], tooltips: ['Avg: 8:48 AM', '±30min variation'] },
        { label: 'Dec', values: [9.0, 0.6], tooltips: ['Avg: 9:00 AM', '±36min variation'] },
      ];
    }

    return {
      data,
      series: [
        { name: 'Average stay (hours)', color: '#065186' },
        { name: 'Variation (±hours)', color: '#1f2937' },
      ],
      startDate,
      endDate,
      yAxisLabels,
      showLegend: true,
      animated: true,
      type: 'line',
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
    const nspCount = 150; // 75% of total
    const facilitatorCount = 50; // 25% of total

    const data: ChartDataPoint[] = [
      {
        label: 'NSPs',
        values: [nspCount],
        tooltips: [`${nspCount} NSPs (${((nspCount / totalParticipants) * 100).toFixed(0)}%)`],
      },
      {
        label: 'Facilitators',
        values: [facilitatorCount],
        tooltips: [
          `${facilitatorCount} Facilitators (${((facilitatorCount / totalParticipants) * 100).toFixed(0)}%)`,
        ],
      },
    ];

    return {
      data,
      series: [
        { name: 'NSPs', color: '#065186' },
        { name: 'Facilitators', color: '#1f2937' },
      ],
      startDate: currentDate,
      endDate: currentDate,
      showLegend: true,
      animated: true,
      type: 'pie',
    };
  }
}
