import { CommonModule } from '@angular/common';
import { Component, NgZone, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { AuthService } from '@app/core/services/auth/auth.service';
import { SummaryCard } from '@app/features/NSP/models/nsp.interface';
import { ActivityListComponent } from '@app/features/NSP/shared/activity-list/activity-list.component';
import { AttendanceSummaryComponent } from '@app/features/NSP/shared/attendance-summary/attendance-summary.component';
import { CalenderComponent } from '@app/features/NSP/shared/calender/calender.component';
import { ProfileComponent } from '@app/features/NSP/shared/profile/profile.component';
import { SlideButtonComponent } from '@app/features/NSP/shared/slide-button/slide-button.component';
import { Store } from '@ngrx/store';
import { checkIn, checkOut, loadAttendanceSummary } from '@store/actions/attendance.actions';
import { selectAttendanceSummary } from '@store/selectors/attendance.selectors';
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
export class DashboardComponent {
  private readonly store = inject(Store);
  private readonly ngZone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authService = inject(AuthService);

  public isScanning = false;
  public allowedFormats = [BarcodeFormat.QR_CODE];
  public attendanceSummary: SummaryCard[] = [];
  public isCheckedIn = false;
  public isLoading = true;

  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions(): void {
    this.store.select(selectAttendanceSummary).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(summary => {
      this.attendanceSummary = summary ?? [];
      this.isLoading = false;
    });

    this.authService.checkedIn$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(checkedIn => {
      this.isCheckedIn = checkedIn;
    });

    this.store.dispatch(loadAttendanceSummary());
  }

  public startQRScanner(): void {
    this.isScanning = true;
  }

  public stopQRScanner(): void {
    this.isScanning = false;
  }

  public onScanSuccess(result: string): void {
    this.ngZone.run(() => {
      this.stopQRScanner();
      if (this.isCheckedIn) {
        this.store.dispatch(checkOut({ sessionCode: result }));
      } else {
        this.store.dispatch(checkIn({ sessionCode: result }));
      }
    });
  }

  public onScanError(error: unknown): void {
    console.error('Scan error:', error);
    this.ngZone.run(() => {
      this.stopQRScanner();
    });
  }
}
