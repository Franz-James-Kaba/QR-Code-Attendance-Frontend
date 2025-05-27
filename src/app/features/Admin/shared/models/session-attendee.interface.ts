export interface SessionAttendee {
  name: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'present' | 'late';
}

export interface SessionAttendanceResponse {
  success: boolean;
  message: string;
  sessionAttendance: {
    id: number;
    firstName: string;
    lastName: string;
    checkInTime: string;
    checkOutTime?: string;
    date: string;
  }[];
}
