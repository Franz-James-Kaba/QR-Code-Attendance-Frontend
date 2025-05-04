// Basic Attendee interface with user-friendly properties for display
export interface Attendee {
  name: string;
  program: string;
  time: string;
}

// API Response model for early attendees
export interface EarlyAttendeeResponse {
  id: number;
  checkInTime: string;
  checkOutTime: string | null;
  userId: number;
  date: string;
  // Additional fields from the user record, which would need to be populated
  user?: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    program?: string;
  };
}

// Paginated response for early attendees
export interface EarlyAttendeePagedResponse {
  content: EarlyAttendeeResponse[];
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

// Helper function to convert API response to view model
export function mapToAttendeeViewModel(attendee: EarlyAttendeeResponse): Attendee {
  // Format the check-in time to a more readable format (e.g. "8:05 AM")
  const checkInTimeDate = new Date(attendee.checkInTime);
  const formattedTime = checkInTimeDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  // Construct the name from user info or fallback to "Unknown User"
  const name = attendee.user ? 
    `${attendee.user.firstName} ${attendee.user.middleName ? attendee.user.middleName + ' ' : ''}${attendee.user.lastName}` : 
    `Unknown User (ID: ${attendee.userId})`;

  // Get program from user info or use a placeholder
  const program = attendee.user?.program || 'Unknown Program';

  return {
    name,
    program,
    time: formattedTime
  };
}