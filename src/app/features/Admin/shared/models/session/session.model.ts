export interface Session {
  id: number;
  title: string;
  description?: string;
  facilitatorId: number;
  facilitatorName?: string;
  location: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  attendanceCount?: number;
  qrCodeUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface SessionListResponse {
  sessions: Session[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export interface CreateSessionRequest {
  title: string;
  description?: string;
  facilitatorId: number;
  location: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
}

export interface UpdateSessionRequest {
  title?: string;
  description?: string;
  facilitatorId?: number;
  location?: string;
  startTime?: string; // ISO string
  endTime?: string; // ISO string
  status?: SessionStatus;
}

export interface SessionFilter {
  status?: SessionStatus;
  facilitatorId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SessionAttendance {
  id: number;
  sessionId: number;
  userId: number;
  userName: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'CHECKED_IN' | 'CHECKED_OUT' | 'MISSED';
}
