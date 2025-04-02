import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'nsp-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './nsp.component.html',
  styleUrls: ['./nsp.component.css']
})
export class NspComponent {
  title = 'nsp-frontend';
}
