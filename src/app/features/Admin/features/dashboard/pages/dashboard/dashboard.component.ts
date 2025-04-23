import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ChartComponent } from '@shared/components/chart/chart.component';
import { ChartDataSet, ChartOptions, TimeRange } from '@shared/models/chart.model';
import { ChartService } from '@shared/services/chart.service';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  bgColor: string;
  textColor: string;
}

interface Attendee {
  name: string;
  program: string;
  time: string;
}

interface QuickAccessItem {
  title: string;
  icon: string;
  link: string;
  bgColor: string;
  textColor: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ButtonComponent, ChartComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public readonly userName = 'Franz';

  // Chart data and state management
  attendanceChartData: ChartDataSet | null = null;
  stayingTimeChartData: ChartDataSet | null = null;
  programDistributionData: ChartDataSet | null = null;
  attendanceChartLoading = true;
  stayingTimeChartLoading = true;
  programDistributionLoading = true;

  // Time ranges
  selectedAttendanceTimeRange: TimeRange = 'Weekly';
  selectedStayingTimeRange: TimeRange = 'Weekly';

  // Chart options
  attendanceChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Weekly',
    responsive: true,
    tooltipEnabled: true,
    height: 300,
    barWidth: 20,
    barGap: 4
  };

  stayingTimeChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Weekly',
    responsive: true,
    tooltipEnabled: true,
    height: 300,
    lineThickness: 2,
    pointRadius: 4
  };

  programDistributionOptions: ChartOptions = {
    showTimeRangeSelector: false,
    height: 250,
    responsive: true,
    tooltipEnabled: true
  };

  // Inject services
  private readonly chartService = inject(ChartService);

  ngOnInit(): void {
    // Load initial chart data
    this.loadAttendanceChartData();
    this.loadStayingTimeChartData();
    this.loadProgramDistributionData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceChartData(): void {
    this.attendanceChartLoading = true;

    // Use the chart service with the updated environment settings
    this.chartService.getChartData('attendance', this.selectedAttendanceTimeRange, 'bar')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.attendanceChartData = data;
          this.attendanceChartLoading = false;
        },
        error: (err) => {
          console.error('Error loading attendance chart data:', err);
          this.attendanceChartLoading = false;
        }
      });
  }

  loadStayingTimeChartData(): void {
    this.stayingTimeChartLoading = true;

    // Use the chart service with the updated environment settings
    this.chartService.getChartData('staying-time', this.selectedStayingTimeRange, 'line')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stayingTimeChartData = data;
          this.stayingTimeChartLoading = false;
        },
        error: (err) => {
          console.error('Error loading staying time chart data:', err);
          this.stayingTimeChartLoading = false;
        }
      });
  }

  loadProgramDistributionData(): void {
    this.programDistributionLoading = true;

    // Use the chart service to fetch program distribution data
    this.chartService.getChartData('program-distribution', 'Monthly', 'pie')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.programDistributionData = data;
          this.programDistributionLoading = false;
        },
        error: (err) => {
          console.error('Error loading program distribution data:', err);
          this.programDistributionLoading = false;
        }
      });
  }

  // Event handlers for time range changes
  onAttendanceTimeRangeChange(timeRange: TimeRange): void {
    this.selectedAttendanceTimeRange = timeRange;
    this.loadAttendanceChartData();
  }

  onStayingTimeRangeChange(timeRange: TimeRange): void {
    this.selectedStayingTimeRange = timeRange;
    this.loadStayingTimeChartData();
  }

  // Action button handlers
  onCreateNsp(): void {
    console.log('Create NSP button clicked');
    // Implement your NSP creation logic here or navigate to NSP creation page
  }

  onCreateFacilitator(): void {
    console.log('Create Facilitator button clicked');
    // Implement your facilitator creation logic here or navigate to facilitator creation page
  }

  // Sample data for dashboard components
  statCards: StatCard[] = [
    {
      title: 'Total NSPs',
      value: 250,
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Active Programs',
      value: 15,
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Facilitators',
      value: 42,
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      title: 'Attendance Rate',
      value: '85%',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
  ];

  earlyAttendees: Attendee[] = [
    { name: 'John Doe', program: 'Web Development NSP', time: '8:02 AM' },
    { name: 'Sarah Johnson', program: 'Data Science NSP', time: '8:05 AM' },
    { name: 'Mark Williams', program: 'UI/UX Design NSP', time: '8:12 AM' },
    { name: 'Emily Davis', program: 'Mobile Development NSP', time: '8:15 AM' },
    { name: 'Daniel Brown', program: 'Cloud Computing NSP', time: '8:20 AM' },
  ];

  quickAccessItems: QuickAccessItem[] = [
    {
      title: 'New NSP',
      icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6',
      link: '#',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Attendance',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      link: '#',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'Reports',
      icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      link: '#',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Settings',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      link: '#',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600',
    },
  ];
}
