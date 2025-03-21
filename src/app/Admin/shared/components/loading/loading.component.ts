import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoadingVariant = 'default' | 'inline' | 'fullscreen' | 'button';
export type LoadingSize = 'sm' | 'md' | 'lg';
export type LoadingColor = 'primary' | 'secondary' | 'tertiary';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingComponent {
  @Input() variant: LoadingVariant = 'default';
  @Input() size: LoadingSize = 'md';
  @Input() color: LoadingColor = 'primary';
  @Input() text = '';
}
