import { ModalService, ModalComponent } from '@Admin/core/services/modal.service';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { Session, SessionRequest } from '@Admin/shared/models/session/session.model';
import { SessionService } from '@Admin/shared/services/session.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from '@shared/components/button/button.component';
import { NotificationService } from '@shared/components/notification/notification.service';

@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent, ModalContainerComponent],
  styleUrls: ['../../../../../../shared/styles/table.css']
})
export class SessionManagementComponent implements OnInit, ModalComponent {
  private readonly sessionService = inject(SessionService);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  sessions: Session[] = [];
  filteredSessions: Session[] = [];
  searchQuery: string = '';
  isLoading = false;
  currentSession: Session | null = null;
  error: string | null = null;
  ngOnInit(): void {
    this.loadSessions();
    this.registerSessionFormModal();
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
  }  openCreateSessionModal(): void {
    this.modalService.openModal('createSession');
  }
  openEditSessionModal(session: Session): void {
    this.modalService.openModal('editSession', session);
  }
  createSession(data: unknown): void {
    const sessionData = data as SessionRequest;
    this.isLoading = true;
    this.error = null;

    // Create the session
    this.sessionService.createSession(sessionData).subscribe({
      next: (response) => {
        if (response.success) {
          this.modalService.closeModal();
          this.loadSessions(); // Refresh the sessions list
          this.isLoading = false;
          this.notificationService.success('Session created successfully');
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
        this.modalService.closeModal();
        this.notificationService.error(this.error);
      }
    });
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

  getStatusClass(active: boolean): string {
    return active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
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
