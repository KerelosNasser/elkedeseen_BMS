declare namespace NodeJS {
  interface ProcessEnv {
    SERVICE_URL: string;
    TURSO_CONNECTION_URL: string;
    TURSO_AUTH_TOKEN: string;
    ADMIN_EMAILS: string;
    DB_MAX_CONNECTIONS?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
