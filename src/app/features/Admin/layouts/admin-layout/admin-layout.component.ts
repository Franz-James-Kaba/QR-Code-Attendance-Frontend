import { HeaderComponent } from '@Admin/shared/components/header/header.component';
import { MobileWarningComponent } from '@Admin/shared/components/mobile-warning/mobile-warning.component';
import { SidebarComponent } from '@Admin/shared/components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    MobileWarningComponent
  ],
  template: `
    <!-- Mobile warning for screens below md breakpoint -->
    @if (isMobileView()) {
      <app-mobile-warning />
    }

    <!-- Admin Layout Structure - only visible on larger screens -->
    <div class="flex h-screen overflow-hidden" [class.hidden]="isMobileView()">
      <!-- Sidebar -->
      <app-sidebar
        [isOpen]="sidebarOpen()"
        [isMinimized]="sidebarMinimized()"
        (toggleSidebar)="toggleSidebar()"
        (closeSidebar)="closeSidebar()"
      />

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto transition-all duration-300 bg-gray-50"
            [class.ml-16]="sidebarMinimized() && sidebarOpen()"
            [class.ml-64]="!sidebarMinimized() && sidebarOpen()"
            [class.ml-0]="!sidebarOpen()">
        <!-- Header -->
        <app-header
          [sidebarOpen]="sidebarOpen()"
          [sidebarMinimized]="sidebarMinimized()"
          (toggleSidebar)="toggleSidebar()"
        />

        <!-- Page Content -->
        <div class="p-4 md:p-6">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `]
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  private readonly MOBILE_BREAKPOINT = 768; // md breakpoint in pixels
  private readonly storageKey = 'admin-sidebar-state';

  // Reactive state using signals
  sidebarOpen = signal(true);
  sidebarMinimized = signal(false);
  isMobileView = signal(false);

  ngOnInit(): void {
    // Load sidebar state from localStorage
    this.loadSidebarState();

    // Set initial mobile view state
    this.checkViewportSize();

    // Add click-outside listener to close sidebar on mobile
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy(): void {
    // Remove click-outside listener
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  @HostListener('window:resize')
  checkViewportSize(): void {
    // Update mobile view state based on window width
    this.isMobileView.set(window.innerWidth < this.MOBILE_BREAKPOINT);

    // Auto-close sidebar on mobile
    if (this.isMobileView()) {
      this.sidebarOpen.set(false);
    } else {
      // Always show sidebar when returning to desktop view
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar(): void {
    if (this.isMobileView()) {
      // On mobile: toggle sidebar open/closed
      this.sidebarOpen.update(value => !value);
    } else {
      // On desktop: toggle sidebar minimized/expanded
      this.sidebarMinimized.update(value => !value);
      // Save state to localStorage
      this.saveSidebarState();
    }
  }

  closeSidebar(): void {
    // Only take action if sidebar is open
    if (this.sidebarOpen()) {
      this.sidebarOpen.set(false);
    }
  }

  private handleClickOutside(event: MouseEvent): void {
    // Close sidebar when clicking outside on mobile
    if (this.isMobileView() && this.sidebarOpen()) {
      // Check if click is outside sidebar (implementation depends on your DOM structure)
      const target = event.target as HTMLElement;
      const sidebar = document.querySelector('app-sidebar');
      const menuButton = document.querySelector('[aria-label="Toggle sidebar"]');

      if (sidebar && !sidebar.contains(target) && menuButton && !menuButton.contains(target)) {
        this.sidebarOpen.set(false);
      }
    }
  }

  private loadSidebarState(): void {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const { minimized } = JSON.parse(savedState);
        this.sidebarMinimized.set(minimized);
      }
    } catch (error) {
      console.error('Failed to load sidebar state from localStorage', error);
    }
  }

  private saveSidebarState(): void {
    try {
      const state = { minimized: this.sidebarMinimized() };
      localStorage.setItem(this.storageKey, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save sidebar state to localStorage', error);
    }
  }
}
