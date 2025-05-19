import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '@core/services/auth/auth.service';
import { Observable, map, of } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Facilitator' | 'NSP';
  avatar?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private readonly authService = inject(AuthService);

  private readonly currentUserSignal = signal<UserProfile>({
    id: '1',
    name: 'Admin User',
    email: this.authService.getCurrentUserEmail() ?? 'admin@example.com',
    role: this.mapRole(this.authService.getCurrentUserRole()),
    avatar: '',
  });

  currentUser = this.currentUserSignal.asReadonly();

  constructor() {
    // Update the user profile when auth state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

        this.currentUserSignal.set({
          id: '1', // We don't have ID in the auth response
          name: fullName || 'User',
          email: user.email ?? '', // Ensure it's never null
          role: this.mapRole(user.role),
          avatar: '',
        });
      }
    });
  }

  // Helper function to map role from auth service to UserProfile role
  private mapRole(role: string | null): 'Admin' | 'Facilitator' | 'NSP' {
    if (!role) return 'Admin'; // Default

    switch (role) {
      case 'ADMIN':
        return 'Admin';
      case 'FACILITATOR':
        return 'Facilitator';
      case 'NSP':
        return 'NSP';
      default:
        return 'Admin';
    }
  }
}
