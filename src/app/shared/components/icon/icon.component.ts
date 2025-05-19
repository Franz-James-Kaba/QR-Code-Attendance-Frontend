import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon.component.html',
})
export class IconComponent {
  @Input() path!: string;
  @Input() size = 24;
  @Input() svgwidth = 24;
  @Input() svgHeight = 24;
  @Input() viewBox = '0 0 24 24';
  @Input() strokeWidth = 2;
  @Input() strokeColor = 'white';
  @Input() class = '';
  @Input() iconClass = '';
}
