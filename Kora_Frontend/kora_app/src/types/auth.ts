// Auth Types & Interfaces

export interface SignInDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpDto {
  email: string;
  password: string;
  fullName: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: ApiError | null;
  signIn: (data: SignInDto) => Promise<void>;
  signUp: (data: SignUpDto) => Promise<void>;
  signOut: () => void;
}
