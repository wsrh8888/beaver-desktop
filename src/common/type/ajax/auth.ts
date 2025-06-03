export interface IAuthResponse {
  code: number;
  message: string;
  result?: {
    token: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface IAuthenticationRes {
  code: number;
  message: string;
  result?: {
    isValid: boolean;
    expiresIn: number;
  };
} 