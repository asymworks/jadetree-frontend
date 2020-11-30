import api from '../api';

/** Jade Tree Application Mode */
export type ServerMode = 'personal' | 'family' | 'public';

/** Jade Tree Version Information */
export type VersionSchema = {
  api_title: string;
  api_version: string;
  app_name: string;
  app_version: string;
  db_version: string;
  needs_setup?: boolean;
  server_currency: string;
  server_language: string;
  server_locale: string;
  server_mode: ServerMode;
}

/** Return the Jade Tree Server Information */
function getVersionInfo(): Promise<VersionSchema> {
  return api.get<VersionSchema>('/version');
}

export default {
  getVersionInfo,
};
