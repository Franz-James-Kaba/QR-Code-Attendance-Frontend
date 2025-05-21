import { CommonModule } from '@angular/common';
import { Component, NgZone, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { SummaryCard } from '@app/features/NSP/models/nsp.interface';
import { ActivityListComponent } from '@app/features/NSP/shared/activity-list/activity-list.component';
import { AttendanceSummaryComponent } from '@app/features/NSP/shared/attendance-summary/attendance-summary.component';
import { CalenderComponent } from '@app/features/NSP/shared/calender/calender.component';
import { ProfileComponent } from '@app/features/NSP/shared/profile/profile.component';
import { SlideButtonComponent } from '@app/features/NSP/shared/slide-button/slide-button.component';
import { Store } from '@ngrx/store';
import { checkIn, checkOut, loadAttendanceSummary } from '@store/actions/attendance.actions';
import {
  selectAttendanceSummary,
  selectIsCheckedIn,
  selectError,
} from '@store/selectors/attendance.selectors';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ProfileComponent,
    CalenderComponent,
    AttendanceSummaryComponent,
    ActivityListComponent,
    SlideButtonComponent,
    ZXingScannerModule,
  ],
  templateUrl: './dashboard.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }

      :host zxing-scanner::ng-deep {
        height: 100vh;
        width: 100vw;
        display: block;
      }

      :host zxing-scanner::ng-deep video {
        height: 100vh !important;
        width: 100vw !important;
        object-fit: cover;
        display: block;
      }

      .error-message {
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        text-align: center;
        max-width: 90%;
      }

      .scanner-controls {
        position: absolute;
        top: 1rem;
        left: 1rem;
        right: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 0.5rem;
      }

      .scanner-controls select {
        background: rgba(0, 0, 0, 0.5);
        color: white;
        border-radius: 0.25rem;
        padding: 0.5rem;
        max-width: 200px;
      }

      .scanner-controls button {
        width: 2.5rem;
        height: 2.5rem;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly store = inject(Store);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  public isScanning = signal(false);
  public errorMessage = signal<string | null>(null);
  public torchEnabled = signal(false);
  public selectedDevice = signal<MediaDeviceInfo | undefined>(undefined);
  public availableDevices = signal<MediaDeviceInfo[]>([]);
  public isCheckedIn = signal(false);
  public isProcessing = signal(false);

  public allowedFormats = [BarcodeFormat.QR_CODE];
  public attendanceSummary: SummaryCard[] = [];
  public isLoading = true;

  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.store
      .select(selectAttendanceSummary)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(summary => {
        this.attendanceSummary = summary ?? [];
        this.isLoading = false;
      });

    this.store
      .select(selectIsCheckedIn)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(checkedIn => {
        this.isCheckedIn.set(checkedIn);
        this.isProcessing.set(false);
      });

    this.store
      .select(selectError)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(error => {
        if (error) {
          this.errorMessage.set(error);
          this.isProcessing.set(false);
        } else {
          this.errorMessage.set(null);
        }
      });

    this.store.dispatch(loadAttendanceSummary());
  }

  private async initializeCameraDevices(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      stream.getTracks().forEach(track => track.stop());

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      this.availableDevices.set(videoDevices);
      this.selectedDevice.set(
        videoDevices.find(
          device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        ) ||
          videoDevices[0] ||
          undefined
      );
    } catch (error) {
      console.error('Error initializing camera devices:', error);
      this.errorMessage.set('Unable to access camera. Please grant permission and try again.');
      throw error;
    }
  }

  public async startQRScanner(): Promise<void> {
    this.errorMessage.set(null);
    try {
      const permissionStatus = await navigator.permissions.query({
        name: 'camera' as PermissionName,
      });
      if (permissionStatus.state === 'granted' || permissionStatus.state === 'prompt') {
        await this.initializeCameraDevices();
        this.isScanning.set(true);
        this.torchEnabled.set(false);
      } else {
        this.errorMessage.set(
          'Camera access denied. Please allow camera access in your browser settings.'
        );
      }
    } catch (error) {
      console.error('Camera permission error:', error);
      this.errorMessage.set(
        'Camera access denied. Please allow camera access in your browser settings.'
      );
    }
  }

  public stopQRScanner(): void {
    this.isScanning.set(false);
    this.errorMessage.set(null);
    this.torchEnabled.set(false);
  }

  public toggleTorch(): void {
    this.torchEnabled.update(enabled => !enabled);
  }

  public onScanSuccess(result: string): void {
    this.ngZone.run(() => {
      this.stopQRScanner();
      this.isProcessing.set(true);
      const isCurrentlyCheckedIn = this.isCheckedIn();
      const action = isCurrentlyCheckedIn
        ? checkOut({ sessionCode: result })
        : checkIn({ sessionCode: result });
      this.store.dispatch(action);
    });
  }

  public onScanError(error: unknown): void {
    console.error('Scan error:', error);
    this.ngZone.run(() => {
      this.errorMessage.set(
        'Error scanning QR code. Please try again or ensure the QR code is visible.'
      );
    });
  }

  public onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices.set(devices);
    if (!this.selectedDevice() && devices.length > 0) {
      this.selectedDevice.set(
        devices.find(
          device =>
            device.label.toLowerCase().includes('back') ||
            device.label.toLowerCase().includes('rear') ||
            device.label.toLowerCase().includes('environment')
        ) ||
          devices[0] ||
          undefined
      );
    }
  }

  public onCameraSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const index = selectElement.selectedIndex;
    if (index >= 0 && index < this.availableDevices().length) {
      this.selectedDevice.set(this.availableDevices()[index]);
    }
  }
}
