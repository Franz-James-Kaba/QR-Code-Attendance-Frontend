import { ModalService, ModalComponent } from '@Admin/core/services/modal.service';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { QrCodeModalComponent } from '@Admin/shared/components/qr-code-modal/qr-code-modal.component';
import { SessionAttendeesComponent } from '@Admin/shared/components/session-attendees/session-attendees.component';
import { Attendee } from '@Admin/shared/models/attendance.model';
import { Session, SessionRequest, SessionQRCodeRequest } from '@Admin/shared/models/session/session.model';
import { AttendanceService } from '@Admin/shared/services/attendance.service';
import { SessionService } from '@Admin/shared/services/session.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';
import { Observable } from 'rxjs';
import { SessionAttendee } from '@Admin/shared/models/session-attendee.interface';

@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    ModalContainerComponent,
    QrCodeModalComponent,
    SessionAttendeesComponent
  ],
  styleUrls: ['../../../../../../shared/styles/table.css']
})
export class SessionManagementComponent implements OnInit, ModalComponent {
  private readonly sessionService = inject(SessionService);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly attendanceService = inject(AttendanceService);

  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  searchQuery: string = '';
  isLoading = false;
  currentSession: Session | null = null;
  error: string | null = null;
  selectedSessionId: number | null = null;
  attendees: SessionAttendee[] = [];
  loadingAttendees = false;

  ngOnInit(): void {
    this.loadSessions();
    this.registerSessionFormModal();
    this.registerQrCodeModal();
  }

  private loadSessions(): void {
    this.isLoading = true;
    this.sessionService.getAllSessions().subscribe({
      next: (sessions) => {
        this.sessions = sessions;
        this.filteredSessions = sessions;
        this.isLoading = false;
      },
      error: (error) => {
        this.error = error.message;
        this.isLoading = false;
        this.notificationService.error('Failed to load sessions');
      }
    });
  }
  private registerSessionFormModal(): void {
    // Register create session modal
    this.modalService.registerModal('createSession', {
      component: this as ModalComponent,
      type: 'session',
      onOpen: () => {
        // Clear any previous data
        this.currentSession = null;
      },
    });

    // Register edit session modal
    this.modalService.registerModal('editSession', {
      component: this as ModalComponent,
      type: 'session',
      onOpen: (data?: unknown) => {
        const session = data as Session;
        // Initialize with session data for editing
        if (session) {
          this.currentSession = session;
          return { type: 'session', data: session };
        } else {
          this.notificationService.error('No session data provided for editing');
          this.modalService.closeModal();
          return null;
        }
      },
    });
  }

  private registerQrCodeModal(): void {
    this.modalService.registerModal('viewQrCode', {
      component: this as ModalComponent,
      type: 'qrCode',
      onOpen: (data?: unknown) => {
        const session = data as Session;
        if (session) {
          const qrCodeData = this.sessionService.getStoredQrCode(session.id);
          if (qrCodeData) {
            return { type: 'qrCode', data: { qrCodeData, sessionName: session.name } };
          }
        }
        this.notificationService.error('QR code not found');
        this.modalService.closeModal();
        return null;
      },
    });
  }

  onSessionClick(session: Session): void {
    this.selectedSessionId = session.id;
    this.loadSessionAttendees(session.id);
  }

  private loadSessionAttendees(sessionId: number): void {
    this.loadingAttendees = true;
    this.attendees = [];

    this.attendanceService.getSessionAttendance(sessionId).subscribe({
      next: (attendees) => {
        this.attendees = attendees;
        this.loadingAttendees = false;
      },
      error: (error) => {
        this.error = error.message;
        this.loadingAttendees = false;
        this.notificationService.error('Failed to load session attendees');
      }
    });
  }

  hasQrCode(session: Session): boolean {
    return this.sessionService.hasStoredQrCode(session.id);
  }

  openQrCodeModal(session: Session, event: Event): void {
    event.stopPropagation(); // Prevent row click event
    this.modalService.openModal('viewQrCode', session);
  }

  openCreateSessionModal(): void {
    this.modalService.openModal('createSession');
  }
  openEditSessionModal(session: Session): void {
    this.modalService.openModal('editSession', session);
  }
  createSession(data: unknown): void {
    const sessionData = data as SessionRequest;
    this.isLoading = true;
    this.error = null;

    // Create the session and generate QR code
    this.sessionService.createSession(sessionData).subscribe({
      next: (response) => {
        if (response.success) {
          // Generate QR code after successful session creation
          this.generateQrCode(sessionData).subscribe({
            next: (qrBlob) => {
              if (response.sessionId) {
                this.sessionService.storeQrCode(response.sessionId, qrBlob);
              }
              this.modalService.closeModal();
              this.loadSessions();
              this.notificationService.success('Session created successfully with QR code');
            },
            error: (_err) => {
              this.notificationService.error('Session created but failed to generate QR code');
              this.modalService.closeModal();
              this.loadSessions();
            }
          });
        } else {
          this.error = 'Failed to create session';
          this.isLoading = false;
          this.modalService.closeModal();
          this.notificationService.error(this.error);
        }
      },
      error: (err) => {
        this.error = `Failed to create session: ${err.message}`;
        this.isLoading = false;
        this.notificationService.error(this.error);
      }
    });
  }

  private generateQrCode(sessionData: SessionRequest): Observable<Blob> {
    const qrRequest: SessionQRCodeRequest = {
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      width: 300,
      height: 300
    };
    return this.sessionService.generateQrCode(qrRequest);
  }

  updateSession(data: unknown): void {
    const sessionData = data as SessionRequest;
    if (!this.currentSession) {
      this.notificationService.error('No session selected for update');
      return;
    }

    this.isLoading = true;

    this.sessionService.updateSession(this.currentSession.id, sessionData).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadSessions();
          this.modalService.closeModal();
          this.notificationService.success('Session updated successfully');
        } else {
          this.notificationService.error('Failed to update session');
        }
        this.isLoading = false;
        this.currentSession = null;
      },
      error: (err) => {
        this.error = `Failed to update session: ${err.message}`;
        this.isLoading = false;
        this.modalService.closeModal();
        this.notificationService.error(this.error);
      }
    });
  }
  deleteSession(sessionId: number): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.sessionService.deleteSession(sessionId).subscribe({
        next: (response) => {
          if (response.success) {
            this.sessionService.removeStoredQrCode(sessionId);
            this.loadSessions();
            this.notificationService.success('Session deleted successfully');
          } else {
            this.notificationService.error('Failed to delete session');
          }
        },
        error: (err) => {
          this.error = `Failed to delete session: ${err.message}`;
          this.notificationService.error(this.error);
        }
      });
    }
  }

  formatSessionTime(time: string): string {
    return this.sessionService.formatSessionTime(time);
  }

  formatTime(timeStr: string): string {
    return new Date(timeStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  getStatusClass(active: boolean): string {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }

  getAttendanceStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.filteredSessions = [...this.sessions];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredSessions = this.sessions.filter(session =>
      session.name.toLowerCase().includes(query)
    );
  }
}
