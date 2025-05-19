import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon.component';

@Component({
  selector: 'app-mobile-warning',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div
      class="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-center"
    >
      <div class="mb-6">
        <app-icon
          path="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          class="w-16 h-16 text-amber-500"
        ></app-icon>
      </div>
      <h1 class="text-2xl font-bold mb-4">Desktop Access Only</h1>
      <p class="text-gray-600 mb-8">
        The Admin dashboard is optimized for desktop use only. Please switch to a larger screen (at
        least 768px width) to access this section.
      </p>
      <div class="bg-gray-100 p-4 rounded-lg">
        <p class="text-sm">
          For the best experience, we recommend using this application on a desktop or laptop
          computer.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class MobileWarningComponent {}
