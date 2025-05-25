import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stat-card.component.html',
})
export class StatCardComponent {
  @Input() value: string = '0';
  @Input() title: string = '';
  @Input() iconPath: string = '';
  @Input() detailsLink: string = '';
}
