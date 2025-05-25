// Basic Attendee interface with user-friendly properties for display
export interface Attendee {
  name: string;
  program?: string;
  role: string;
  time: string;
}

// API Response model for early attendees
export interface EarlyAttendeeResponse {
  firstName: string;
  lastName: string;
  role: string;
  checkInTime: string;
}

// Helper function to convert API response to view model
export function mapToAttendeeViewModel(attendee: EarlyAttendeeResponse): Attendee {
  // Format the check-in time to a more readable format (e.g. "8:05 AM")
  const checkInTimeDate = new Date(attendee.checkInTime);
  const formattedTime = checkInTimeDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return {
    name: `${attendee.firstName} ${attendee.lastName}`.trim(),
    role: attendee.role || 'Unknown',
    time: formattedTime
  };
}
