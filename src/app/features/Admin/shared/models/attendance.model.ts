export interface Attendee {
  id: number;
  name: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'absent' | 'late';
}

export interface SessionAttendance {
  sessionId: number;
  attendees: Attendee[];
}
