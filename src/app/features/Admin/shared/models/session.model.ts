export interface Session {
  id: number;
  sessionCode: string;
  name: string;
  active: boolean;
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
}

export interface GenerateQRCodeResponse {
  qrCodeUrl: string;
}
