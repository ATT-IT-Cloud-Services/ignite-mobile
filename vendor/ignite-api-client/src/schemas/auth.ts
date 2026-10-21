export interface User {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  nickname?: string | null;
  twoFactorEnabled?: boolean;
  [key: string]: unknown;
}

export interface Session {
  id: string;
  userAgent?: string | null;
  ip?: string | null;
  createdAt?: string;
  lastActiveAt?: string;
  isCurrent?: boolean;
  [key: string]: unknown;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  requiresTwoFactor?: boolean;
}

export interface MeResponse {
  success: boolean;
  user: User;
}

export interface SessionsResponse {
  success: boolean;
  sessions: Session[];
}

export interface TwoFactorSetupResponse {
  success: boolean;
  secret: string;
  otpauthUrl: string;
  qrCode?: string;
}

export interface TwoFactorEnableResponse {
  success: boolean;
  backupCodes?: string[];
}
