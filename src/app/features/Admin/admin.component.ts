import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'admin-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './admin.component.html',
})
export class AdminComponent {
  title = 'admin-frontend';
}
