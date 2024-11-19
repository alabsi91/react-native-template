declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production";
    }
  }
}

export const OS = {
  Android: "android",
  IOS: "ios",
  Web: "web",
  Windows: "windows",
} as const;

export type OSType = (typeof OS)[keyof typeof OS];
