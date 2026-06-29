export type AuthView = "welcome" | "register" | "login";

export type SessionUser = {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  type: "guest" | "customer";
};

export type StoredAccount = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
};

export type RegisterForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginForm = {
  phone: string;
  email: string;
  password: string;
};

export type RegisterRequest = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  phoneNumber: string;
  password: string;
};

export type AuthUserResponse = {
  id?: number;
  userId?: number;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  roles?: string;
};

export type AuthResponse = {
  token: string;
  userId?: number;
  user?: AuthUserResponse;
  email?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  name?: string;
  phone?: string;
  phoneNumber?: string;
  role?: string;
  roles?: string;
};
