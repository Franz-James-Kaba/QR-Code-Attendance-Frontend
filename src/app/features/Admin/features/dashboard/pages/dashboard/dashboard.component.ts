import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { PersonnelTableComponent } from '@Admin/shared/components/personnel-table/personnel-table.component';
import { Attendee } from '@Admin/shared/models/attendee.interface';
import { AttendanceService } from '@Admin/shared/services/attendance.service';
import { FacilitatorService } from '@Admin/shared/services/facilitator.service';
import { NspService } from '@Admin/shared/services/nsp.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { ModalService } from '@app/features/Admin/core/services/modal.service';
import { ButtonComponent } from '@shared/components/button/button.component';
import { ChartComponent } from '@shared/components/chart/chart.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { ChartDataSet, ChartOptions, TimeRange } from '@shared/models/chart.model';
import { ChartService } from '@shared/services/chart.service';
import { Subject, takeUntil, forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    ChartComponent,
    StatCardComponent,
    PersonnelTableComponent,
    ModalContainerComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  public readonly userName = 'Franz';

  nspCount: number = 0;
  facilitatorCount: number = 0;
  isLoadingCounts: boolean = false;

  earlyAttendees: Attendee[] = [];
  isLoadingEarlyAttendees: boolean = false;
  earlyAttendeesTotal: number = 0;

  attendanceChartData: ChartDataSet | null = null;
  stayingTimeChartData: ChartDataSet | null = null;
  programDistributionData: ChartDataSet | null = null;
  attendanceChartLoading = true;
  stayingTimeChartLoading = true;
  programDistributionLoading = true;

  selectedAttendanceTimeRange: TimeRange = 'Weekly';
  selectedStayingTimeRange: TimeRange = 'Weekly';

  attendanceChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Weekly',
    responsive: true,
    tooltipEnabled: true,
    height: 300,
    barWidth: 20,
    barGap: 4,
  };

  stayingTimeChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Weekly',
    responsive: true,
    tooltipEnabled: true,
    height: 300,
    lineThickness: 2,
    pointRadius: 4,
  };

  programDistributionOptions: ChartOptions = {
    showTimeRangeSelector: false,
    height: 250,
    responsive: true,
    tooltipEnabled: true,
  };

  private readonly chartService = inject(ChartService);
  private readonly modalService = inject(ModalService);
  private readonly nspService = inject(NspService);
  private readonly facilitatorService = inject(FacilitatorService);
  private readonly attendanceService = inject(AttendanceService);
  private readonly notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loadUserCounts();
    this.loadAttendanceChartData();
    this.loadStayingTimeChartData();
    this.loadProgramDistributionData();
    this.loadEarlyAttendees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAttendanceChartData(): void {
    this.attendanceChartLoading = true;

    this.chartService
      .getChartData('attendance', this.selectedAttendanceTimeRange, 'bar')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.attendanceChartData = data;
          this.attendanceChartLoading = false;
        },
        error: err => {
          console.error('Error loading attendance chart data:', err);
          this.attendanceChartLoading = false;
        },
      });
  }

  loadStayingTimeChartData(): void {
    this.stayingTimeChartLoading = true;

    this.chartService
      .getChartData('staying-time', this.selectedStayingTimeRange, 'line')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.stayingTimeChartData = data;
          this.stayingTimeChartLoading = false;
        },
        error: err => {
          console.error('Error loading staying time chart data:', err);
          this.stayingTimeChartLoading = false;
        },
      });
  }

  loadProgramDistributionData(): void {
    this.programDistributionLoading = true;

    // Use the chart service to fetch program distribution data
    this.chartService
      .getChartData('program-distribution', 'Monthly', 'pie')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: data => {
          this.programDistributionData = data;
          this.programDistributionLoading = false;
        },
        error: err => {
          console.error('Error loading program distribution data:', err);
          this.programDistributionLoading = false;
        },
      });
  }

  /**
   * Load NSP and Facilitator counts from the API simultaneously
   */
  loadUserCounts(): void {
    this.isLoadingCounts = true;

    // Use forkJoin to make both API calls in parallel
    forkJoin({
      nsps: this.nspService.getAllNsps(0, 1), // Just need the total count, not all records
      facilitators: this.facilitatorService.getAllFacilitators(0, 1),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: results => {
          this.nspCount = results.nsps.total;
          this.facilitatorCount = results.facilitators.total;
          this.isLoadingCounts = false;
        },
        error: err => {
          console.error('Error loading user counts:', err);
          this.isLoadingCounts = false;
        },
      });
  }

  /**
   * Load early attendees from the API
   */
  loadEarlyAttendees(): void {
    this.isLoadingEarlyAttendees = true;

    // Calculate date range (today and yesterday)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format dates as YYYY-MM-DD
    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    this.attendanceService.getEarlyAttendees(startDate, endDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.earlyAttendees = result.data;
          this.earlyAttendeesTotal = result.total;
          this.isLoadingEarlyAttendees = false;
        },
        error: err => {
          console.error('Error loading early attendees:', err);
          this.notificationService.error('Failed to load early attendees', { duration: 5000 });
          this.isLoadingEarlyAttendees = false;

          // Fallback to mock data in case of error
          this.earlyAttendees = [
            { name: 'John Doe', program: 'Web Development NSP', time: '8:02 AM' },
            { name: 'Sarah Johnson', program: 'Data Science NSP', time: '8:05 AM' },
            { name: 'Mark Williams', program: 'UI/UX Design NSP', time: '8:12 AM' },
            { name: 'Emily Davis', program: 'Mobile Development NSP', time: '8:15 AM' },
            { name: 'Daniel Brown', program: 'Cloud Computing NSP', time: '8:20 AM' },
          ];
        },
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
    this.modalService.openModal('createNsp');
  }

  onCreateFacilitator(): void {
    this.modalService.openModal('createFacilitator');
  }
}
