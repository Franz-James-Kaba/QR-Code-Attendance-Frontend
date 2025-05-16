import { CommonModule } from '@angular/common';
import { Component, NgZone, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { CalenderComponent } from '@app/features/NSP/shared/calender/calender.component';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';

import { DashboardService } from './logic/services/dashboard/dashboard.service';
import { SummaryCard } from './models/nsp.interface';
import { ActivityListComponent } from './shared/activity-list/activity-list.component';
import { AttendanceSummaryComponent } from './shared/attendance-summary/attendance-summary.component';
import { ProfileComponent } from './shared/profile/profile.component';
import { SlideButtonComponent } from './shared/slide-button/slide-button.component';

@Component({
  selector: 'nsp-root',
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
  templateUrl: './nsp.component.html',
  styles: [
    `
      :host {
        display: block;
        height: 100vh;
        width: 100vw;
      }

      :host zxing-scanner::ng-deep {
        height: 100%;
        width: 100%;
      }

      :host zxing-scanner::ng-deep video {
        height: 100vh !important;
        width: 100vw !important;
        object-fit: cover;
      }
    `,
  ],
})
export class NspComponent {
  title = 'nsp-frontend';
  public isScanning = signal(false);
  public allowedFormats = [BarcodeFormat.QR_CODE];
  public attendanceSummary = signal<SummaryCard[]>([]);

  constructor(
    private readonly ngZone: NgZone,
    private readonly dashboardService: DashboardService
  ) {
    this.loadAttendanceSummary();
  }

  private loadAttendanceSummary(): void {
    this.dashboardService
      .getAttendanceSummaryData()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (summary: SummaryCard[]) => {
          this.ngZone.run(() => {
            this.attendanceSummary.set(summary);
          });
        },
        error: (error: unknown) => {
          this.ngZone.run(() => {
            console.error('Error loading attendance summary:', error);
          });
        },
      });
  }

  public startQRScanner(): void {
    this.isScanning.set(true);
  }

  public stopQRScanner(): void {
    this.isScanning.set(false);
  }

  public onScanSuccess(result: string): void {
    this.stopQRScanner();
    this.checkIn(result);
  }

  public onScanError(error: unknown): void {
    console.error('Scan error:', error);
    this.ngZone.run(() => {
      this.stopQRScanner();
    });
  }

  public checkIn(sessionCode: string): void {
    this.ngZone.run(() => {
      this.dashboardService
        .checkIn(sessionCode)
        .pipe(takeUntilDestroyed())
        .subscribe({
          next: () => {
            this.ngZone.run(() => {
              this.loadAttendanceSummary();
            });
          },
          error: (error: unknown) => {
            this.ngZone.run(() => {
              console.error('Check-in error:', error);
            });
          },
        });
    });
  }
}
