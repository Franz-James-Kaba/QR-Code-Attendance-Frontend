export interface DashboardStatistics {
  totalUsers: number;
  totalSessions: number;
  totalAttendees: number;
  ongoingSessions: number;
  usersPerRole: {
    role: string;
    count: number;
  }[];
  sessionsPerWeek: {
    date: string;
    count: number;
  }[];
  attendancePercentage: number;
}

export interface RecentActivity {
  id: number;
  type: 'session_started' | 'session_ended' | 'user_created' | 'user_login' | 'attendance_marked';
  description: string;
  timestamp: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface DashboardResponse {
  statistics: DashboardStatistics;
  recentActivities: RecentActivity[];
}
