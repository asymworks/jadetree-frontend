import api from '../api';
import { UserSchema } from './user.service';

export type AuthUserSchema = {
  email: string;
  name: string;
}

export type AuthRequestSchema = {
  email: string;
  password: string;
}

export type AuthResponseSchema = {
  token: string;
  user: UserSchema;
}

export type AuthRegisterSchema = {
  email: string;
  name: string;
  password: string;
}

/**
 * Return the list of Authorized Users (will throw error if the server is not
 * in 'personal' or 'family' mode)
 */
function getUserList(): Promise<AuthUserSchema[]> {
  return api.get<AuthUserSchema[]>('/auth/login');
}

/** Log In a User */
function login(email: string, password: string): Promise<AuthResponseSchema> {
  const payload: AuthRequestSchema = { email, password };
  return api.post<AuthResponseSchema>('/auth/login', payload);
}

/** Register a new User */
function register(payload: AuthRegisterSchema): Promise<UserSchema> {
  return api.post<UserSchema>('/auth/register', payload);
}

/** Confirm the User Registration */
function cancel(token: string): Promise<void> {
  return api.get<void>(`/auth/cancel?token=${encodeURI(token)}`);
}

/** Confirm the User Registration */
function confirm(token: string): Promise<void> {
  return api.get<void>(`/auth/confirm?token=${encodeURI(token)}`);
}

/** Resend a Confirmation Email */
function resend(email: string): Promise<UserSchema> {
  return api.get<UserSchema>(`/auth/resendConfirmation?email=${encodeURIComponent(email)}`);
}

export default {
  cancel,
  confirm,
  getUserList,
  login,
  register,
  resend,
};
