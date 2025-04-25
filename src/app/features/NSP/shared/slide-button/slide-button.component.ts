import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'app-slide-button',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <button
      class="w-full bg-[#065186] text-white py-4 px-6 rounded-xl shadow-(#00000026) flex items-center justify-center text-base font-bold"
    >
      <app-icon path="/assets/icon/check-out.svg" />
      Slide to Check In
    </button>
  `,
})
export class SlideButtonComponent {}
