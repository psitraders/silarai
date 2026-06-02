export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiry: string;
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  roles: string[];
}

export interface RegisterRequest {
  businessName: string;
  ownerName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface User {
  userId: string;
  email: string;
  roles: string[];
}
