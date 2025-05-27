import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ButtonComponent } from '@shared/components/button/button.component';

@Component({
  selector: 'app-qr-code-modal',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="p-6">
      <div class="flex flex-col items-center space-y-6">
        <h2 class="text-xl font-semibold">Session QR Code</h2>

        <!-- QR Code Image -->
        <div class="w-64 h-64">
          <img [src]="qrCodeData" alt="Session QR Code" class="w-full h-full object-contain" />
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center space-x-3">
          <app-button
            variant="secondary"
            size="md"
            (buttonClick)="onClose()"
          >
            Close
          </app-button>
          <app-button
            variant="primary"
            size="md"
            (buttonClick)="onDownload()"
          >
            Download
          </app-button>
        </div>
      </div>
    </div>
  `,
})
export class QrCodeModalComponent {
  @Input() qrCodeData: string = '';
  @Input() sessionName: string = '';

  onClose(): void {
    // This will be handled by the parent component
  }

  onDownload(): void {
    const link = document.createElement('a');
    link.href = this.qrCodeData;
    link.download = `${this.sessionName.replace(/\s+/g, '_')}_qr_code.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
