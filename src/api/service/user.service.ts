import api from '../api';

/** User Information Schema */
export type UserSchema = {
  id?: number;

  /* User Email Address and Name */
  email?: string;
  name?: string;

  /* User Profile Preferences */
  language?: string;
  locale?: string;
  currency?: string;

  fmt_date_short?: string;
  fmt_date_long?: string;
  fmt_decimal?: string;
  fmt_currency?: string;
  fmt_accounting?: string;

  /* Registration Status */
  active?: boolean;
  confirmed?: boolean;
  confirmed_at?: string;
  profile_setup?: boolean;
  profile_setup_at?: string;
}

/** Update User Profile Information */
function updateUserProfile(profile: UserSchema): Promise<UserSchema> {
  return api.put<UserSchema>('/user', profile);
}

export default {
  updateUserProfile,
};
