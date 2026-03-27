export type UserRole = "ADMIN" | "AUDITOR" | "DM" | "QUALITY" | "CLIENT";

export type User = {
  id: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  passwordSetupToken: string | null;
  passwordSetupExpires: string | null;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = {
  user: User;
  access_token: string;
};

export type AuthContextType = {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  loading: boolean;
};
