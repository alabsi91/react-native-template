declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
    }
  }
}

export enum OS {
  Android = 'Android',
  IOS = 'IOS',
  Web = 'Web',
  Windows = 'Windows',
}
