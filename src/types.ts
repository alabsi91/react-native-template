declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
    }
  }
}

export const OS = {
  Android: 'Android',
  IOS: 'IOS',
  Web: 'Web',
  Windows: 'Windows',
} as const;

export type OSType = (typeof OS)[keyof typeof OS];
