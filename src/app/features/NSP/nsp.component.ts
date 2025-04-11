import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'nsp-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nsp.component.html'
})
export class NspComponent {
  title = 'nsp-frontend';
}
