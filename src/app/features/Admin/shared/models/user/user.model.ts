import { UserRole } from '@shared/models/auth/auth.model';

export interface AdminUser {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoggedInAt?: string;
  isActive: boolean;
}

export interface AdminUserListResponse {
  users: AdminUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateUserRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface UpdateUserRequest {
  id: number;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserFilter {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
