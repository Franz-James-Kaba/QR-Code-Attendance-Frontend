export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Session {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  status: SessionStatus;
  attendees?: number;
  location?: string;
  description?: string;
  createdBy?: string;
}

export interface SessionFilter {
  page: number;
  size: number;
  status?: SessionStatus;
  startDate?: string;
  endDate?: string;
  location?: string;
}

export interface SessionListResponse {
  content: Session[];
  pageable: {
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateSessionRequest {
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

export interface UpdateSessionRequest {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}

export interface SessionFormData {
  name: string;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
}
