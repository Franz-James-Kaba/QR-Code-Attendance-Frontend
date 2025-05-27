export type SessionStatus = 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Session {
  id: number;
  sessionCode: string;
  name: string;
  active: boolean;
  status?: SessionStatus;
  startTime: string;
  endTime: string;
}

export interface SessionRequest {
  name?: string;
  startTime: string;
  endTime: string;
}

export interface SessionQRCodeRequest {
  startTime: string;
  endTime: string;
  width?: number;
  height?: number;
}

export interface SessionResponse {
  message: string;
  success: boolean;
  sessionId: number;
}

export interface GenerateQRCodeResponse {
  qrCodeUrl: string;
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
