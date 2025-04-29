import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  AdminUser,
  AdminUserListResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilter
} from '@features/Admin/shared/models/user/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminUserService {
  private readonly API_URL = `${environment.admin.baseUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Get all users with optional filtering
   */
  getUsers(filter: UserFilter = {}): Observable<AdminUserListResponse> {
    let params = new HttpParams();

    if (filter.role) {
      params = params.set('role', filter.role);
    }

    if (filter.search) {
      params = params.set('search', filter.search);
    }

    if (filter.page) {
      params = params.set('page', filter.page.toString());
    }

    if (filter.limit) {
      params = params.set('limit', filter.limit.toString());
    }

    if (filter.sortBy) {
      params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) {
        params = params.set('sortOrder', filter.sortOrder);
      }
    }

    return this.http.get<AdminUserListResponse>(this.API_URL, { params })
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a specific user by ID
   */
  getUserById(id: number): Observable<AdminUser> {
    return this.http.get<AdminUser>(`${this.API_URL}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new user
   */
  createUser(userData: CreateUserRequest): Observable<AdminUser> {
    return this.http.post<AdminUser>(this.API_URL, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update an existing user
   */
  updateUser(userId: number, userData: UpdateUserRequest): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.API_URL}/${userId}`, userData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a user
   */
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Deactivate a user
   */
  deactivateUser(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.API_URL}/${userId}/deactivate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Activate a user
   */
  activateUser(userId: number): Observable<AdminUser> {
    return this.http.patch<AdminUser>(`${this.API_URL}/${userId}/activate`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Send password reset link to a user
   */
  sendPasswordResetLink(userId: number): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/${userId}/reset-password`, {})
      .pipe(catchError(this.handleError));
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 401) {
        errorMessage = 'Unauthorized. Please log in again.';
      } else if (error.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (error.status === 409) {
        errorMessage = 'A user with this email already exists.';
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }

    return throwError(() => new Error(errorMessage));
  }
}
