import { ModalService } from '@Admin/core/services/modal.service';
import { ModalContainerComponent } from '@Admin/shared/components/modal-container/modal-container.component';
import { SessionFormComponent } from '@Admin/shared/components/session-form/session-form.component';
import { CreateSessionRequest, Session } from '@Admin/shared/models/session/session.model';
import { SessionService } from '@Admin/shared/services/session.service';
import { StorageService } from '@Admin/shared/services/storage.service';
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
export class SessionManagementComponent implements OnInit {
  private readonly sessionService = inject(SessionService);
  private readonly storageService = inject(StorageService);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);

  sessions: { sessionData: Session; qrCodeUrl: string; createdAt: string }[] = [];
  searchQuery: string = '';
  private allSessions: { sessionData: Session; qrCodeUrl: string; createdAt: string }[] = [];
  isLoading = false;
  qrCodeUrl: string | null = null;
  currentSession: Session | null = null;
  error: string | null = null;
  showQrModal = false;

  ngOnInit(): void {
    this.loadSavedSessions();
    this.registerSessionFormModal();
  }

  private loadSavedSessions(): void {
    this.allSessions = this.storageService.getStoredSessions();
    this.sessions = [...this.allSessions];
  }  private registerSessionFormModal(): void {
    // Register create session modal
    this.modalService.registerModal('createSession', {
      component: this,
      onOpen: () => {
        // Clear any previous data
        this.currentSession = null;
      },
    });

    // Register edit session modal
    this.modalService.registerModal('editSession', {
      component: this,
      onOpen: (session: Session) => {
        // Initialize with session data for editing
        if (session) {
          this.currentSession = session;
        } else {
          this.notificationService.error('No session data provided for editing');
          this.modalService.closeModal();
        }
      },
    });
  }openCreateSessionModal(): void {
    // Make sure QR modal is closed first
    if (this.showQrModal) {
      this.closeQrModal();
      // Wait for QR modal to close before opening create modal
      setTimeout(() => {
        this.modalService.openModal('createSession');
      }, 300);
    } else {
      this.modalService.openModal('createSession');
    }
  }
  openEditSessionModal(session: Session): void {
    // Make sure QR modal is closed first
    if (this.showQrModal) {
      this.closeQrModal();
      // Wait for QR modal to close before opening edit modal
      setTimeout(() => {
        this.modalService.openModal('editSession', session);
      }, 300);
    } else {
      this.modalService.openModal('editSession', session);
    }
  }  private generateUniqueId(): string {
    // First try crypto.randomUUID()
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }

    // Fallback implementation
    const array = new Uint8Array(16);
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      crypto.getRandomValues(array);
    } else {
      // Last resort fallback
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
    }

    // Convert to UUID format
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  createSession(sessionData: CreateSessionRequest): void {
    this.isLoading = true;
    this.error = null;

    this.sessionService.generateQrCode(sessionData).subscribe({
      next: (qrBlob) => {
        const generatedSession: Session = {
          id: this.generateUniqueId(), // Use our cross-platform UUID generator
          name: sessionData.name,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime,
          status: 'SCHEDULED',
          location: sessionData.location,
          description: sessionData.description,
        };

        // Convert blob to data URL for display and storage
        this.storageService.blobToDataUrl(qrBlob).then(qrDataUrl => {
          // Store in local storage
          this.storageService.saveSession(generatedSession, qrDataUrl);

          // Close modal before showing QR code
          this.modalService.closeModal();

          // Update UI
          setTimeout(() => {
            this.qrCodeUrl = qrDataUrl;
            this.currentSession = generatedSession;
            this.showQrModal = true;
            this.loadSavedSessions(); // Refresh the sessions list
            this.isLoading = false;
            this.notificationService.success('Session created successfully');
          }, 300);
        });
      },
      error: (err) => {
        this.error = `Failed to generate QR code: ${err.message}`;
        this.isLoading = false;
        this.modalService.closeModal();
        this.notificationService.error(this.error);
      }
    });
  }

  updateSession(sessionData: CreateSessionRequest): void {
    if (!this.currentSession) {
      this.notificationService.error('No session selected for update');
      return;
    }

    this.isLoading = true;

    // Update the session (with the same ID)
    const updatedSession: Session = {
      ...this.currentSession,
      name: sessionData.name,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      location: sessionData.location,
      description: sessionData.description,
    };

    // Re-generate QR code if needed (for this demo we'll reuse the existing QR code)
    const existingSessionWithQr = this.sessions.find(s => s.sessionData.id === this.currentSession?.id);
    if (existingSessionWithQr) {
      // Store the updated session with the existing QR code
      this.storageService.updateSession(updatedSession, existingSessionWithQr.qrCodeUrl);

      // Update UI
      this.loadSavedSessions();
      this.modalService.closeModal();
      this.notificationService.success('Session updated successfully');
    } else {
      this.notificationService.error('Session not found');
    }

    this.isLoading = false;
    this.currentSession = null;
  }
  viewQrCode(session: Session, qrCodeUrl: string): void {
    // Make sure to close any open modals first
    if (this.modalService.isModalVisible()) {
      this.modalService.closeModal();
    }

    // Wait a bit for modal to close before showing QR
    setTimeout(() => {
      this.qrCodeUrl = qrCodeUrl;
      this.currentSession = session;
      this.showQrModal = true;
    }, 300);
  }

  downloadQrCode(): void {
    if (!this.qrCodeUrl) return;

    const a = document.createElement('a');
    a.href = this.qrCodeUrl;
    a.download = `qr-code-${this.currentSession?.name ?? 'session'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  closeQrModal(): void {
    this.showQrModal = false;
    this.qrCodeUrl = null;
    this.currentSession = null;
  }

  deleteSession(sessionId: string): void {
    if (confirm('Are you sure you want to delete this session?')) {
      this.storageService.removeSession(sessionId);
      this.loadSavedSessions();
      this.notificationService.success('Session deleted successfully');
    }
  }

  formatSessionTime(time: string | Date): string {
    return this.sessionService.formatSessionTime(typeof time === 'string' ? time : time.toISOString());
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'ONGOING':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onSearch(): void {
    if (!this.searchQuery) {
      this.sessions = [...this.allSessions];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.sessions = this.allSessions.filter(session =>
      session.sessionData.name.toLowerCase().includes(query) ||
      session.sessionData.location?.toLowerCase().includes(query) ||
      session.sessionData.description?.toLowerCase().includes(query)
    );
  }
}
