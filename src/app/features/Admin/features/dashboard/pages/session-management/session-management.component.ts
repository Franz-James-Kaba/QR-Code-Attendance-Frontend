import { CreateSessionRequest, Session } from '@Admin/shared/models/session/session.model';
import { SessionService } from '@Admin/shared/services/session.service';
import { StorageService } from '@Admin/shared/services/storage.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


@Component({
  selector: 'app-session-management',
  templateUrl: './session-management.component.html',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class SessionManagementComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly sessionService = inject(SessionService);
  private readonly storageService = inject(StorageService);

  sessionForm!: FormGroup;
  sessions: { sessionData: Session; qrCodeUrl: string; createdAt: string }[] = [];
  isLoading = false;
  qrCodeUrl: string | null = null;
  currentSession: Session | null = null;
  error: string | null = null;
  showQrModal = false;

  ngOnInit(): void {
    this.initForm();
    this.loadSavedSessions();
  }

  private initForm(): void {
    this.sessionForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      location: [''],
      description: [''],
    });
  }

  private loadSavedSessions(): void {
    this.sessions = this.storageService.getStoredSessions();
  }

  onSubmit(): void {
    if (this.sessionForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.sessionForm.controls).forEach(key => {
        const control = this.sessionForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    this.error = null;

    const sessionData: CreateSessionRequest = {
      name: this.sessionForm.value.name,
      startTime: new Date(this.sessionForm.value.startTime).toISOString(),
      endTime: new Date(this.sessionForm.value.endTime).toISOString(),
      location: this.sessionForm.value.location,
      description: this.sessionForm.value.description,
    };

    this.sessionService.generateQrCode(sessionData).subscribe({
      next: (qrBlob) => {
        // Create a session object to store (normally would come from backend)
        const generatedSession: Session = {
          id: crypto.randomUUID(), // Generate a unique ID locally
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
          
          // Update UI
          this.qrCodeUrl = qrDataUrl;
          this.currentSession = generatedSession;
          this.showQrModal = true;
          this.loadSavedSessions(); // Refresh the sessions list
          this.isLoading = false;
          this.sessionForm.reset();
        });
      },
      error: (err) => {
        this.error = `Failed to generate QR code: ${err.message}`;
        this.isLoading = false;
      }
    });
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
    }
  }

  isStartDateValid(): boolean {
    const startDate = this.sessionForm.get('startTime')?.value;
    return !startDate || new Date(startDate) >= new Date();
  }

  isEndDateValid(): boolean {
    const startDate = this.sessionForm.get('startTime')?.value;
    const endDate = this.sessionForm.get('endTime')?.value;
    
    return !startDate || !endDate || new Date(endDate) > new Date(startDate);
  }

  formatSessionTime(time: string | Date): string {
    return this.sessionService.formatSessionTime(typeof time === 'string' ? time : time.toISOString());
  }
}