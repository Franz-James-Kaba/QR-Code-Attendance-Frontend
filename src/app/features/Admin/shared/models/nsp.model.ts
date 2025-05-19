export interface NSPRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
}

export interface NSPResponse {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  passwordResetRequired?: boolean;
  createdAt?: string;
}

export interface PagedResponse<T> {
  content: T[];
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

// For bulk import
export interface NSPImportResult {
  successful: number;
  failed: number;
  errors: { email: string; reason: string }[];
}

// For UI representation - used by the existing components
export interface NSPViewModel {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role?: string;
  passwordResetRequired?: boolean;
  createdAt?: string;
}

// For mapping between API model and view model
export const mapToViewModel = (nsp: NSPResponse): NSPViewModel => {
  return {
    id: nsp.id.toString(),
    firstName: nsp.firstName,
    middleName: nsp.middleName,
    lastName: nsp.lastName,
    email: nsp.email,
    role: nsp.role,
    passwordResetRequired: nsp.passwordResetRequired,
    createdAt: nsp.createdAt
  };
};

export const mapToApiModel = (nsp: NSPViewModel): NSPRequest => {
  return {
    firstName: nsp.firstName,
    middleName: nsp.middleName,
    lastName: nsp.lastName,
    email: nsp.email
  };
};