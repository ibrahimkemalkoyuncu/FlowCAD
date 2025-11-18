const getEnvVar = (key: keyof ImportMetaEnv, defaultValue?: string): string => {
  const value = import.meta.env[key];
  
  if (value === undefined || value === '') {
    if (defaultValue !== undefined) {
      return defaultValue;
    }
    throw new Error(`Environment variable ${key} is required but not defined`);
  }
  
  return String(value);
};

export const config = {
  apiUrl: getEnvVar('VITE_API_URL', 'https://localhost:7121'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Type export (opsiyonel ama yararlı)
export type Config = typeof config;