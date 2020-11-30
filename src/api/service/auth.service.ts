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

/**
 * Return the list of Authorized Users (will throw error if the server is not
 * in 'personal' or 'family' mode)
 */
function authUsers(): Promise<AuthUserSchema[]> {
  return api.get<AuthUserSchema[]>('/auth/login');
}

/** Log In a User */
function login(email: string, password: string): Promise<AuthResponseSchema> {
  const payload: AuthRequestSchema = { email, password };
  return api.post<AuthResponseSchema>('/auth/login', payload);
}

export default {
  authUsers,
  login,
};
