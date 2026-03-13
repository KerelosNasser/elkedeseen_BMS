declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    ADMIN_EMAILS: string;
    CRON_SECRET: string;
    DB_MAX_CONNECTIONS?: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}
