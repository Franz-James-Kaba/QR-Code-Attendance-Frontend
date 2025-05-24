import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { PersonnelTableComponent } from '@Admin/shared/components/personnel-table/personnel-table.component';
import { Attendee } from '@Admin/shared/models/attendee.interface';
import { AttendanceService } from '@Admin/shared/services/attendance.service';
import { FacilitatorService } from '@Admin/shared/services/facilitator.service';
import { NspService } from '@Admin/shared/services/nsp.service';
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { AuthService } from '@app/core/services/auth/auth.service';
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
  userName: string = 'Admin';

  nspCount: number = 0;
  facilitatorCount: number = 0;
  isLoadingCounts: boolean = false;

  earlyAttendees: Attendee[] = [];
  isLoadingEarlyAttendees: boolean = false;
  earlyAttendeesTotal: number = 0;
  earlyAttendeesPage: number = 0;
  earlyAttendeesSize: number = 5;

  attendanceChartData: ChartDataSet | null = null;
  stayingTimeChartData: ChartDataSet | null = null;
  programDistributionData: ChartDataSet | null = null;
  attendanceChartLoading = true;
  stayingTimeChartLoading = true;
  programDistributionLoading = true;
  selectedAttendanceTimeRange: TimeRange = 'Daily';
  selectedStayingTimeRange: TimeRange = 'Daily';

  attendanceChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Daily',
    responsive: true,
    tooltipEnabled: true,
    height: 300,
    barWidth: 40,
    barGap: 8,
  };
  stayingTimeChartOptions: ChartOptions = {
    showTimeRangeSelector: true,
    defaultTimeRange: 'Daily',
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
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loadUserCounts();
    this.loadAttendanceChartData();
    this.loadStayingTimeChartData();
    this.loadProgramDistributionData();
    this.loadEarlyAttendees();
    this.loadUserName();
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
          // Add time labels for y-axis (6am to 6pm)
          const timeLabels = ['6am', '7am', '8am', '9am', '10am', '11am', '12pm',
                             '1pm', '2pm', '3pm', '4pm', '5pm', '6pm'];
          this.attendanceChartData = {
            ...data,
            yAxisLabels: timeLabels
          };
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
          // Add time duration labels for y-axis (hours)
          const timeLabels = ['1hr', '2hrs', '3hrs', '4hrs', '5hrs', '6hrs', '7hrs', '8hrs'];
          this.stayingTimeChartData = {
            ...data,
            yAxisLabels: timeLabels
          };
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

  loadUserCounts(): void {
    this.isLoadingCounts = true;

    forkJoin({
      nsps: this.nspService.getAllNsps(0, 1),
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

  loadEarlyAttendees(): void {
    this.isLoadingEarlyAttendees = true;
    this.earlyAttendees = [];
    this.earlyAttendeesTotal = 0;

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const startDate = yesterday.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    this.attendanceService
      .getEarlyAttendees(startDate, endDate, this.earlyAttendeesPage, this.earlyAttendeesSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: result => {
          this.earlyAttendees = result.data;
          this.earlyAttendeesTotal = result.total;
          this.isLoadingEarlyAttendees = false;
        },
        error: err => {
          console.error('Error loading early attendees:', err);
          this.earlyAttendees = [];
          this.earlyAttendeesTotal = 0;
          this.isLoadingEarlyAttendees = false;
        },
      });
  }
  loadUserName(): void {
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        if (user?.firstName && user?.lastName) {
          this.userName = user.firstName;
        } else if (user?.firstName) {
          this.userName = user.firstName;
        } else if (user?.lastName) {
          this.userName = user.lastName;
        } else if (user?.email) {
          const emailName = user.email.split('@')[0];
          this.userName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        } else {
          this.userName = 'Admin';
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

  onEarlyAttendeesPageChange(page: number): void {
    this.earlyAttendeesPage = page;
    this.loadEarlyAttendees();
  }

  onEarlyAttendeesSizeChange(size: number): void {
    this.earlyAttendeesSize = size;
    this.loadEarlyAttendees();
  }

  // Action button handler
  onCreateSession(): void {
    this.modalService.openModal('createSession');
  }
}
