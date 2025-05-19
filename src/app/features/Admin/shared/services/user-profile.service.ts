import { Injectable, signal } from '@angular/core';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Facilitator' | 'NSP';
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private currentUserSignal = signal<UserProfile>({
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'Admin',
    avatar: ''
  });

  currentUser = this.currentUserSignal.asReadonly();

  constructor() { }

  // In a real application, this would come from an auth service
  // For now we'll mock it for demonstration
  getCurrentUser(): UserProfile {
    return this.currentUserSignal();
  }
}