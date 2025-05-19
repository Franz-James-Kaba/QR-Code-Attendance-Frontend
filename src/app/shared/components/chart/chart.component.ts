import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ChartDataPoint,
  ChartDataSet,
  ChartOptions,
  ChartType,
  TimeRange,
} from '@shared/models/chart.model';

interface PieChartArc {
  path: string;
  stroke: string;
  fill: string;
  label: string;
  percentage: number;
  value: number;
  visible: boolean;
  percentageLabel?: string;
}

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  animations: [
    trigger('barAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0.3 }),
        animate('800ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ height: '*', opacity: 1 })),
      ]),
      transition(
        '* => *',
        [
          style({ height: '{{ prevHeight }}px' }),
          animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ height: '*' })),
        ],
        { params: { prevHeight: 0 } }
      ),
    ]),
    trigger('lineAnimation', [
      transition(':enter', [
        style({ opacity: 0, strokeDashoffset: 1000 }),
        animate('800ms ease-out', style({ opacity: 1, strokeDashoffset: 0 })),
      ]),
    ]),
    trigger('pointAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0)' }),
        animate(
          '400ms 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
    ]),
    trigger('pieAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate(
          '600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
          style({ opacity: 1, transform: 'scale(1)' })
        ),
      ]),
      transition('* => *', [animate('500ms cubic-bezier(0.34, 1.56, 0.64, 1)')]),
    ]),
  ],
})
export class ChartComponent implements OnInit, OnChanges {
  // Make Math available to the template
  readonly Math = Math;

  // Input properties
  @Input() dataSet: ChartDataSet | null = null;
  @Input() options: ChartOptions = {};
  @Input() isLoading = false;
  @Input() chartType: ChartType = 'bar';

  // Output events
  @Output() timeRangeChanged = new EventEmitter<TimeRange>();

  // View children for DOM manipulation
  @ViewChild('tooltip') tooltipElement!: ElementRef;
  @ViewChild('chartScrollContainer') chartScrollContainer!: ElementRef;
  @ViewChild('chartContentWrapper') chartContentWrapper!: ElementRef;

  // Public properties
  public timeRanges: TimeRange[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];
  public selectedTimeRange: TimeRange = 'Weekly';
  public chartData: ChartDataPoint[] = [];
  public yAxisLabels: string[] = [];
  public animationState = 'final';
  public barHeights: { [key: string]: string } = {};
  public tooltipVisible = false;
  public tooltipX = 0;
  public tooltipY = 0;
  public tooltipLabel = '';
  public tooltipSeriesName = '';
  public tooltipValue = 0;
  public chartPointsData: string[] = [];
  public animationInProgress = false;

  // Track visible series for toggle functionality
  public visibleSeries: boolean[] = [];

  // Chart dimensions and styling - using readonly for constants
  private readonly columnWidth = 60;
  private containerWidth = 0;
  public barWidth = 20;
  public barGap = 2;
  private readonly minBarWidth = 8;
  private readonly maxBarWidth = 30;
  public lineThickness = 1; // Reduced for thinner lines
  public pointRadius = 1; // Reduced for smaller points
  public chartHeight = 100;

  // PIE CHART SPECIFIC METHODS
  public pieChartArcs: PieChartArc[] = [];
  public filteredChartData: ChartDataPoint[] = [];

  constructor() {}

  @HostListener('window:resize')
  onWindowResize() {
    this.calculateChartDimensions();
  }

  ngOnInit(): void {
    // Initialize with defaults or provided options
    this.initializeOptions();
    this.initializeVisibleSeries();
    this.processChartData();

    // Set CSS variables for SVG styling
    this.updateSvgCssVariables();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSet']?.currentValue) {
      this.initializeVisibleSeries();
      this.processChartData();
    }

    if (changes['options'] && !changes['options'].firstChange) {
      this.initializeOptions();
      this.updateSvgCssVariables();
    }
  }

  private initializeOptions(): void {
    // Set defaults based on provided options - using nullish coalescing
    this.selectedTimeRange = this.options.defaultTimeRange ?? 'Weekly';
    this.barWidth = this.options.barWidth ?? this.barWidth;
    this.barGap = this.options.barGap ?? this.barGap;
    this.lineThickness = this.options.lineThickness ?? this.lineThickness;
    this.pointRadius = this.options.pointRadius ?? this.pointRadius;
    this.chartHeight = this.options.height ?? this.chartHeight;
  }

  // Initialize visible series array
  private initializeVisibleSeries(): void {
    if (this.dataSet?.series?.length) {
      this.visibleSeries = this.dataSet.series.map(() => true);
    }
  }

  // Toggle series visibility
  public toggleSeries(index: number): void {
    if (index >= 0 && index < this.visibleSeries.length) {
      this.visibleSeries[index] = !this.visibleSeries[index];
      this.animateChartTransition();

      if (this.chartType === 'pie') {
        this.processChartDataForPieChart();
      }
    }
  }

  private processChartData(): void {
    if (!this.dataSet?.data?.length) {
      return;
    }

    this.chartData = this.dataSet.data;
    this.yAxisLabels = this.dataSet.yAxisLabels || [];

    // Apply filter for visible series
    this.applySeriesFilter();

    // Handle different chart types
    if (this.chartType === 'bar') {
      this.initializeBarHeights();
      this.updateBarHeights();
      this.calculateChartDimensions();
    } else if (this.chartType === 'line') {
      this.generateLineChartPoints();
    } else if (this.chartType === 'pie') {
      this.processChartDataForPieChart();
    }
  }

  // Apply filter for visible series
  private applySeriesFilter(): void {
    // For pie chart, filter out the hidden series
    if (this.chartType === 'pie') {
      this.filteredChartData = this.chartData.filter((_, index) =>
        index < this.visibleSeries.length ? this.visibleSeries[index] : true
      );
    }
  }

  // TIME RANGE HANDLING
  onTimeRangeChange(): void {
    this.timeRangeChanged.emit(this.selectedTimeRange);
    this.animateChartTransition();
  }

  animateChartTransition(): void {
    this.animationInProgress = true;
    setTimeout(() => {
      this.animationInProgress = false;
    }, this.options.animationDuration ?? 600);
  }

  // BAR CHART SPECIFIC METHODS
  private initializeBarHeights(): void {
    if (this.chartData?.length) {
      this.chartData.forEach((item, index) => {
        (item.values || []).forEach((_, valueIndex) => {
          this.barHeights[`value-${index}-${valueIndex}`] = '0';
        });
      });
    }
  }

  private updateBarHeights(): void {
    if (this.chartData?.length) {
      this.chartData.forEach((item, index) => {
        (item.values || []).forEach((value, valueIndex) => {
          const height = this.getBarHeight(value);
          this.barHeights[`value-${index}-${valueIndex}`] = height;
        });
      });
    }
  }

  getBarHeight(value: number): string {
    // Calculate the maximum value in the dataset for scaling
    let maxValue = 0;
    if (this.dataSet?.data) {
      this.dataSet.data.forEach(item => {
        item.values.forEach(val => {
          if (val > maxValue) maxValue = val;
        });
      });
    }

    // Prevent division by zero
    if (maxValue === 0) maxValue = 1;

    // Scale the value based on chart height (minus some padding)
    const availableHeight = this.chartHeight * 0.9; // 90% of chart height
    const heightPercentage = value / maxValue;
    const heightValue = heightPercentage * availableHeight;

    // Ensure a minimum height for visibility
    const minHeight = 4;
    return `${Math.max(heightValue, minHeight)}px`;
  }

  getBarHeightValue(value: number, itemIndex: number, valueIndex: number): string {
    const key = `value-${itemIndex}-${valueIndex}`;
    return this.barHeights[key] || this.getBarHeight(value);
  }

  calculateChartDimensions(): void {
    if (!this.chartData.length) return;

    // Get container width or fallback
    if (this.chartContentWrapper?.nativeElement) {
      this.containerWidth = this.chartContentWrapper.nativeElement.clientWidth;
    } else if (this.chartScrollContainer?.nativeElement) {
      this.containerWidth = this.chartScrollContainer.nativeElement.clientWidth - 48;
    }

    if (!this.containerWidth) return;

    const totalPoints = this.chartData.length;
    const seriesCount = this.dataSet?.series?.length ?? 1;

    // Calculate bar width based on available space and number of bars
    const availableSpace = this.containerWidth * 0.8; // Use 80% of container width for bars
    const totalBarsWidth = availableSpace / totalPoints;
    const barWidthCalculated = totalBarsWidth / seriesCount - this.barGap;

    // Apply constraints
    this.barWidth = Math.min(Math.max(barWidthCalculated, this.minBarWidth), this.maxBarWidth);
  }

  getMinContainerWidth(): number {
    if (!this.chartData.length) return 300;

    // Simple calculation based on number of data points
    return Math.max(300, this.chartData.length * 50);
  }

  getBarWidthPx(): string {
    return `${this.barWidth}px`;
  }

  // LINE CHART SPECIFIC METHODS
  generateLineChartPoints(): void {
    if (!this.dataSet?.data?.length) return;

    const seriesCount = this.dataSet.series?.length ?? 0;
    this.chartPointsData = [];

    // Find min and max for proper scaling
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;

    this.dataSet.data.forEach(point => {
      point.values.forEach(value => {
        minValue = Math.min(minValue, value);
        maxValue = Math.max(maxValue, value);
      });
    });

    // Create line paths for each series
    for (let seriesIndex = 0; seriesIndex < seriesCount; seriesIndex++) {
      this.chartPointsData[seriesIndex] = this.dataSet.data
        .map((item, index) => {
          const value = item.values[seriesIndex] || 0;
          const x = (index / (this.dataSet!.data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / (maxValue - minValue)) * 100;
          return `${x},${y}`;
        })
        .join(' ');
    }

    // Generate y-axis labels if not provided
    if (!this.dataSet.yAxisLabels || this.dataSet.yAxisLabels.length === 0) {
      this.generateYAxisLabels(minValue, maxValue);
    }
  }

  generateYAxisLabels(minValue: number, maxValue: number): void {
    this.yAxisLabels = [];
    const steps = 5; // Number of steps on y-axis

    // Create labels in ascending order (0 at bottom, max at top)
    for (let i = steps; i >= 0; i--) {
      const value = minValue + ((maxValue - minValue) * (steps - i)) / steps;
      this.yAxisLabels.push(value.toFixed(0));
    }
  }

  // Helper method to get the y-position for a value (for line charts)
  getYPosition(value: number, minValue: number, maxValue: number): number {
    if (minValue === maxValue) return 50; // Handle edge case to avoid division by zero
    return 100 - ((value - minValue) / (maxValue - minValue)) * 100;
  }

  // Calculate min value for chart data
  getMinValue(): number {
    if (!this.chartData || this.chartData.length === 0) return 0;

    let allValues: number[] = [];
    this.chartData.forEach(point => {
      if (point.values && point.values.length > 0) {
        allValues = allValues.concat(point.values);
      }
    });

    return allValues.length > 0 ? Math.min(...allValues) : 0;
  }

  // Calculate max value for chart data
  getMaxValue(): number {
    if (!this.chartData || this.chartData.length === 0) return 100;

    let allValues: number[] = [];
    this.chartData.forEach(point => {
      if (point.values && point.values.length > 0) {
        allValues = allValues.concat(point.values);
      }
    });

    return allValues.length > 0 ? Math.max(...allValues) : 100;
  }

  // PIE CHART SPECIFIC METHODS
  // Process pie chart data
  processChartDataForPieChart(): void {
    if (!this.dataSet?.data?.length) return;

    // Apply series filter
    this.applySeriesFilter();

    this.pieChartArcs = [];
    const centerX = 50;
    const centerY = 50;
    const radius = 40;

    // Calculate total value from visible data only
    const total = this.getTotalValue();
    if (total === 0) return;

    let startAngle = 0;

    // Generate pie chart segments for visible data points
    this.chartData.forEach((item, index) => {
      // Skip if this series is not visible
      if (index < this.visibleSeries.length && !this.visibleSeries[index]) {
        return;
      }

      // We only use the first value of each data point for pie charts
      const value = item.values?.[0] ?? 0;
      const percentage = (value / total) * 100;

      // Convert percentage to angle (360 degrees = 100%)
      const angleSize = (percentage / 100) * 360;
      const endAngle = startAngle + angleSize;

      // Calculate path for arc
      const path = this.describeArc(centerX, centerY, radius, startAngle, endAngle);

      // Get color from series or use default
      const color = this.dataSet?.series?.[index]?.color ?? this.getDefaultColor(index);

      // Create percentage label at the midpoint of the arc
      const midAngle = startAngle + angleSize / 2;
      const labelPosition = this.getArcTextPosition(centerX, centerY, radius, midAngle);
      const percentageLabel = percentage >= 5 ? `${Math.round(percentage)}%` : '';

      this.pieChartArcs.push({
        path,
        stroke: color,
        fill: 'none', // Hollow circle
        label: item.label,
        percentage,
        value,
        visible: true,
        percentageLabel,
      });

      // Update start angle for next segment
      startAngle = endAngle;
    });
  }

  // Calculate arc path for pie chart
  describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number): string {
    // Convert angles from degrees to radians
    const start = this.degToRad(startAngle - 90); // Adjust to start from top (subtract 90 degrees)
    const end = this.degToRad(endAngle - 90);

    // Calculate start and end points
    const startX = x + radius * Math.cos(start);
    const startY = y + radius * Math.sin(start);
    const endX = x + radius * Math.cos(end);
    const endY = y + radius * Math.sin(end);

    // Flag for large arc (more than 180 degrees)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    // Create SVG path
    return `M ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`;
  }

  // Convert degrees to radians
  degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  // Calculate arc text position for percentage labels
  getArcTextPosition(
    centerX: number,
    centerY: number,
    radius: number,
    angle: number
  ): { x: number; y: number } {
    // Position text along the arc at the specified angle
    // Use 85% of radius to place text within the arc stroke
    const adjustedRadius = radius * 0.85;
    const radians = this.degToRad(angle - 90); // Adjust to start from top

    return {
      x: centerX + adjustedRadius * Math.cos(radians),
      y: centerY + adjustedRadius * Math.sin(radians),
    };
  }

  // Get total value for pie chart (only counting visible series)
  getTotalValue(): number {
    if (!this.chartData || this.chartData.length === 0) return 0;

    return this.chartData.reduce((sum, item, index) => {
      // Skip if this series is not visible
      if (index < this.visibleSeries.length && !this.visibleSeries[index]) {
        return sum;
      }
      // We only use the first value of each data point for pie charts
      return sum + (item.values?.[0] ?? 0);
    }, 0);
  }

  // Get default color for pie chart segments
  getDefaultColor(index: number): string {
    const colors = [
      '#3b82f6', // blue-500
      '#8b5cf6', // purple-500
      '#10b981', // emerald-500
      '#f59e0b', // amber-500
      '#ef4444', // red-500
      '#ec4899', // pink-500
    ];

    return colors[index % colors.length];
  }

  // Show tooltip for pie chart
  showPieTooltip(event: MouseEvent, label: string, percentage: number): void {
    this.tooltipLabel = label;
    this.tooltipSeriesName = 'Percentage';
    this.tooltipValue = Math.round(percentage);

    // Calculate position within the pie chart area
    if (!event.currentTarget) return;
    const pieContainer = (event.currentTarget as HTMLElement).closest(
      '.pie-chart-container'
    ) as HTMLElement;
    const containerRect = pieContainer.getBoundingClientRect();
    this.tooltipX = event.clientX - containerRect.left;
    this.tooltipY = event.clientY - containerRect.top - 10;

    // Show the tooltip
    this.tooltipVisible = true;

    // Track mouse movement
    const target = event.currentTarget as SVGElement;

    // Remove existing listeners to avoid duplicates
    target.removeEventListener('mousemove', this.handleMouseMove);

    // Add mouse move listener
    target.addEventListener('mousemove', this.handleMouseMove);

    // Add the mouseleave listener to hide tooltip when cursor leaves the element
    target.addEventListener(
      'mouseleave',
      () => {
        this.hideTooltip();
        target.removeEventListener('mousemove', this.handleMouseMove);
      },
      { once: true }
    );
  }

  // SHARED UTILITY METHODS
  formatDateRange(): string {
    if (!this.dataSet?.startDate || !this.dataSet?.endDate) {
      return '';
    }

    const startDate = this.dataSet.startDate;
    const endDate = this.dataSet.endDate;

    if (this.selectedTimeRange === 'Weekly') {
      return `${startDate.getDate()}${this.getOrdinalSuffix(startDate.getDate())} - ${endDate.getDate()}${this.getOrdinalSuffix(endDate.getDate())} ${this.getMonthName(startDate.getMonth())}, ${startDate.getFullYear()}`;
    } else if (this.selectedTimeRange === 'Monthly') {
      return `${this.getMonthName(startDate.getMonth())}, ${startDate.getFullYear()}`;
    } else if (this.selectedTimeRange === 'Daily') {
      return `${startDate.getDate()}${this.getOrdinalSuffix(startDate.getDate())} ${this.getMonthName(startDate.getMonth())}, ${startDate.getFullYear()}`;
    } else {
      return `${startDate.getFullYear()}`;
    }
  }

  getMonthName(month: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[month];
  }

  getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  // TOOLTIP METHODS
  showTooltip(event: MouseEvent, label: string, seriesName: string, value: number): void {
    // Prevent multiple tooltip activations
    if (this.tooltipVisible) {
      return;
    }

    // Update tooltip content
    this.tooltipLabel = label;
    this.tooltipSeriesName = seriesName;
    this.tooltipValue = value;

    if (!event.currentTarget) return;

    // Calculate position within the chart area
    const chartContainer =
      (event.currentTarget as HTMLElement).closest('.chart-content-wrapper') ||
      (event.currentTarget as HTMLElement).closest('.chart-svg-container') ||
      event.currentTarget;

    // Get coordinates relative to chart container
    const containerRect = (chartContainer as HTMLElement).getBoundingClientRect();
    this.tooltipX = event.clientX - containerRect.left;
    this.tooltipY = event.clientY - containerRect.top - 10; // Small offset to not overlap cursor

    // Show the tooltip
    this.tooltipVisible = true;

    // Track mouse movement for better positioning
    const target = event.currentTarget as HTMLElement;

    // Remove existing listeners to avoid duplicates
    target.removeEventListener('mousemove', this.handleMouseMove);

    // Add mouse move listener with throttling to prevent rapid updates
    target.addEventListener('mousemove', this.handleMouseMove);

    // Add the mouseleave listener to hide tooltip when cursor leaves the element
    target.addEventListener(
      'mouseleave',
      () => {
        this.hideTooltip();
        target.removeEventListener('mousemove', this.handleMouseMove);
      },
      { once: true }
    );
  }

  // Handle mouse movement for tooltip tracking
  private readonly handleMouseMove = (event: MouseEvent): void => {
    if (!this.tooltipVisible) return;

    const chartContainer =
      (event.currentTarget as HTMLElement).closest('.chart-content-wrapper') ||
      (event.currentTarget as HTMLElement).closest('.chart-svg-container') ||
      (event.currentTarget as HTMLElement).closest('.pie-chart-container') ||
      event.currentTarget;

    const containerRect = (chartContainer as HTMLElement).getBoundingClientRect();
    this.tooltipX = event.clientX - containerRect.left;
    this.tooltipY = event.clientY - containerRect.top - 10;
  };

  hideTooltip(): void {
    this.tooltipVisible = false;
  }

  // CHART TYPE HELPERS
  isBarChart(): boolean {
    return this.chartType === 'bar';
  }

  isLineChart(): boolean {
    return this.chartType === 'line';
  }

  isPieChart(): boolean {
    return this.chartType === 'pie';
  }

  getChartTypeClass(): string {
    return `chart-${this.chartType}`;
  }

  private updateSvgCssVariables(): void {
    // Use CSS variables to control SVG styling directly
    document.documentElement.style.setProperty('--line-thickness', `${this.lineThickness}px`);
    document.documentElement.style.setProperty('--point-radius', `${this.pointRadius}px`);
  }
}
