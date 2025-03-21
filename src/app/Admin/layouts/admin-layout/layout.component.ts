import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css'
})
export class LayoutComponent {
  isSidebarOpen = signal(true);
  isSidebarMinimized = signal(false);

  toggleSidebar() {
    if (window.innerWidth >= 768) {
      this.isSidebarMinimized.update(state => !state);
    } else {
      this.isSidebarOpen.update(state => !state);
    }
  }
}
