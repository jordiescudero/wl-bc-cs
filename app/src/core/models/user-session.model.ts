export interface CredentialsDTO {
    accessToken?: {expiresAt: Date};
    refreshToken?: {expiresAt: Date};
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  }

export interface LoginRequestDTO {
username: string;
password: string;
remember?: boolean;
}

export interface ResetRequestDTO {
  username: string;
}

export interface RegisterRequestDTO {
  firstName: string;
  lastName: string;
  email: string;
}
