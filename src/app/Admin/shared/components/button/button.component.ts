import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../loading/loading.component';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'danger' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Input() fullWidth = false;
  @Input() icon?: string;
  @Input() iconPosition: 'left' | 'right' = 'left';

  @Output() buttonClick = new EventEmitter<void>();

  get classes(): string {
    return `
      inline-flex items-center justify-center rounded-md font-medium transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:pointer-events-none
      ${this.getSizeClasses()}
      ${this.getVariantClasses()}
      ${this.fullWidth ? 'w-full' : ''}
    `.trim();
  }

  get loadingSize(): 'sm' | 'md' | 'lg' {
    const sizes = {
      sm: 'sm',
      md: 'sm',
      lg: 'md'
    } as const;
    return sizes[this.size];
  }

  private getSizeClasses(): string {
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg'
    };
    return sizes[this.size];
  }

  private getVariantClasses(): string {
    const variants = {
      primary: 'bg-black text-white hover:bg-gray-700 focus:ring-gray-500',
      secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
      outline: 'border-2 border-black-600 text-black-600 hover:bg-black-50 focus:ring-black-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    };
    return variants[this.variant];
  }

  onClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit();
    }
  }
}
