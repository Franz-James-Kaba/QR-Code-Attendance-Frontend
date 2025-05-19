import { ModalService } from '@Admin/core/services/modal.service';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { Session, SessionFilter, SessionStatus, SessionListResponse } from '@Admin/shared/models/session/session.model';
import { SessionService } from '@Admin/shared/services/session.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { finalize, Subscription } from 'rxjs';
@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    ModalContainerComponent,
    DatePipe
  ],
  templateUrl: './session-management.component.html',
})
export class SessionManagementComponent implements OnInit, OnDestroy {
  // Dependencies
  private readonly sessionService = inject(SessionService);
  private readonly notificationService = inject(NotificationService);
  private readonly modalService = inject(ModalService);

  // Component state
  sessions: Session[] = [];
  selectedSession: Session | null = null;
  isLoading = false;
  showQrCodeModal = false;
  qrCodeUrl = '';
  qrCodeGenerating = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalItems = 0;

  // Filters
  selectedStatus: string = 'all';
  statusOptions: string[] = ['all', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'];

  // Date filter
  dateFilter: { startDate?: string; endDate?: string } = {};

  // Subscriptions
  private modalClosedSubscription: Subscription | null = null;
  private modalVisibilitySubscription: Subscription | null = null;

  ngOnInit(): void {
    this.loadSessions();

    // Subscribe to modal closed events to refresh sessions list
    this.modalVisibilitySubscription = this.modalService.modalVisible$.subscribe(visible => {
      if (!visible && (this.modalService.getModalType() === 'createSession' || this.modalService.getModalType() === 'editSession')) {
        this.loadSessions();
      }
    });

    // Also subscribe to the explicit modalClosed event for direct handling
    this.modalClosedSubscription = this.modalService.modalClosed.subscribe(event => {
      if (event && (event.id === 'createSession' || event.id === 'editSession')) {
        this.loadSessions();
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    if (this.modalVisibilitySubscription) {
      this.modalVisibilitySubscription.unsubscribe();
    }
    if (this.modalClosedSubscription) {
      this.modalClosedSubscription.unsubscribe();
    }
  }

  loadSessions(): void {
    this.isLoading = true;

    // Build filter
    const filter: SessionFilter = {
      page: this.currentPage,
      size: this.pageSize
    };

    // Add status filter if not "all"
    if (this.selectedStatus !== 'all') {
      // Type check to ensure only valid SessionStatus values are used
      if (this.isValidSessionStatus(this.selectedStatus)) {
        filter.status = this.selectedStatus;
      }
    }

    // Add date filters if provided
    if (this.dateFilter.startDate) {
      filter.startDate = this.dateFilter.startDate;
    }
    if (this.dateFilter.endDate) {
      filter.endDate = this.dateFilter.endDate;
    }

    this.sessionService.getSessions(filter)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response: SessionListResponse) => {
          this.sessions = response.content;
          this.totalItems = response.totalElements;
        },
        error: (error) => {
          this.notificationService.error(error.message ?? 'Failed to load sessions');
        }
      });
  }

  onFilterChange(): void {
    this.currentPage = 0; // Reset pagination when filters change
    this.loadSessions();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadSessions();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus = select.value;
    this.onFilterChange();
  }

  onDateFilterChange(): void {
    this.onFilterChange();
  }

  createSession(): void {
    this.modalService.openModal('createSession');
  }

  editSession(session: Session): void {
    this.modalService.openModal('editSession', session);
  }

  cancelSession(session: Session): void {
    if (confirm(`Are you sure you want to cancel the session scheduled for ${this.sessionService.formatSessionTime(session.startTime)}?`)) {
      this.isLoading = true;

      this.sessionService.cancelSession(session.id)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.notificationService.success('Session cancelled successfully');
            this.loadSessions();
          },
          error: (error) => {
            this.notificationService.error(error.message ?? 'Failed to cancel session');
          }
        });
    }
  }

  generateQrCode(session: Session): void {
    this.selectedSession = session;
    this.qrCodeUrl = '';
    this.qrCodeGenerating = true;
    this.showQrCodeModal = true;

    this.sessionService.generateQrCode(session.id)
      .pipe(finalize(() => this.qrCodeGenerating = false))
      .subscribe({
        next: (url) => {
          this.qrCodeUrl = url;
        },
        error: (error) => {
          this.notificationService.error(error.message ?? 'Failed to generate QR code');
          this.showQrCodeModal = false;
        }
      });
  }

  closeQrCodeModal(): void {
    this.showQrCodeModal = false;
    this.selectedSession = null;

    // Revoke object URL to prevent memory leaks
    if (this.qrCodeUrl) {
      URL.revokeObjectURL(this.qrCodeUrl);
      this.qrCodeUrl = '';
    }
  }

  downloadQrCode(): void {
    if (!this.qrCodeUrl || !this.selectedSession) return;

    const link = document.createElement('a');
    link.href = this.qrCodeUrl;
    link.download = `session-qr-${this.selectedSession.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get a formatted status text
   */
  getStatusText(status: string): string {
    // Only process if it's a valid SessionStatus
    if (this.isValidSessionStatus(status)) {
      return status.charAt(0) + status.slice(1).toLowerCase();
    }
    return status; // Return as-is if not a valid SessionStatus
  }

  /**
   * Get CSS classes for status badge
   */
  getStatusClass(status: SessionStatus): string {
    const color = this.sessionService.getStatusColor(status);
    return `bg-${color}-100 text-${color}-800`;
  }

  /**
   * Type guard to check if a string is a valid SessionStatus
   */
  private isValidSessionStatus(status: string): status is SessionStatus {
    return ['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED'].includes(status);
  }
}
