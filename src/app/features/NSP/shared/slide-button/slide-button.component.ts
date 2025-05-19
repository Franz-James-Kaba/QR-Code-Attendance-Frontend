import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '@app/shared/components/icon/icon.component';

@Component({
  selector: 'app-slide-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      class="w-full bg-primary text-white py-4 px-6 rounded-xl shadow-(#00000026) flex items-center justify-center text-base font-bold gap-2"
      (click)="startScan()"
    >
      <app-icon
        viewBox="0 0 21 16"
        [size]="18"
        [svgwidth]="21"
        [svgHeight]="16"
        path="M15.5 9L19.5 5M19.5 5L15.5 1M19.5 5H6.5C3.73858 5 1.5 7.23858 1.5 10C1.5 12.7614 3.73858 15 6.5 15H11.5"
      />
      <span>{{ isCheckedIn ? 'Slide to Check Out' : 'Slide to Check In' }}</span>
    </button>
  `,
})
export class SlideButtonComponent {
  @Input() isCheckedIn = false;
  @Output() scanRequested = new EventEmitter<void>();

  public startScan(): void {
    this.scanRequested.emit();
  }
}
