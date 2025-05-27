import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SummaryCard } from '@app/features/NSP/models/nsp.interface';
import { IconComponent } from '@app/shared/components/icon/icon.component';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="grid grid-cols-2 gap-4">
      @for (card of attendanceSummary; track card.title) {
        <div class="w-full rounded-xl p-4 bg-primary text-white">
          <div class="flex items-center gap-1 mb-1">
            <app-icon
              [path]="card.icon.path"
              [size]="card.icon.size"
              [viewBox]="card.icon.viewBox"
              class="w-5 h-5"
            />
            <span class="text-sm font-semibold text-white">{{ card.title }}</span>
          </div>
          <div>
            <p class="font-bold text-base text-white mb-1">{{ card.value }}</p>
            <p class="font-normal text-10 text-white">{{ card.description }}</p>
          </div>
        </div>
      }
    </div>
  `,
})
export class AttendanceSummaryComponent {
  @Input() public attendanceSummary!: SummaryCard[];
}
