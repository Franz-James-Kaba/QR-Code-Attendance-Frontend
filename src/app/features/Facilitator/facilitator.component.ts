import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'facilitator-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './facilitator.component.html',
  styleUrls: ['./facilitator.component.scss']
})
export class FacilitatorComponent {
  title = 'facilitator-frontend';
}
