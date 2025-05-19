export interface FacilitatorRequest {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  program?: string;
}

export interface FacilitatorResponse {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  role: string;
  program?: string;
  passwordResetRequired?: boolean;
  hasReceptionPrivilege?: boolean;
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
export interface FacilitatorImportResult {
  successful: number;
  failed: number;
  errors: { email: string; reason: string }[];
}

// For UI representation
export interface FacilitatorViewModel {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  program?: string;
  role?: string;
  passwordResetRequired?: boolean;
  hasReceptionPrivilege?: boolean;
  createdAt?: string;
}

// For mapping between API model and view model
export const mapToViewModel = (facilitator: FacilitatorResponse): FacilitatorViewModel => {
  return {
    id: facilitator.id.toString(),
    firstName: facilitator.firstName,
    middleName: facilitator.middleName,
    lastName: facilitator.lastName,
    email: facilitator.email,
    program: facilitator.program,
    role: facilitator.role,
    passwordResetRequired: facilitator.passwordResetRequired,
    hasReceptionPrivilege: facilitator.hasReceptionPrivilege,
    createdAt: facilitator.createdAt
  };
};

export const mapToApiModel = (facilitator: FacilitatorViewModel): FacilitatorRequest => {
  return {
    firstName: facilitator.firstName,
    middleName: facilitator.middleName,
    lastName: facilitator.lastName,
    email: facilitator.email,
    program: facilitator.program
  };
};