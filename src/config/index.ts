/**
 * Application Configuration
 *
 * Environment-based configuration for API endpoints and feature flags.
 */

interface Config {
  apiBaseUrl: string;
  environment: 'development' | 'staging' | 'production';
}

const getConfig = (): Config => {
  // Default to production config
  const config: Config = {
    apiBaseUrl: 'https://spark-adhd-api.vercel.app',
    environment: 'production',
  };

  // Override with environment variables if available
  if (typeof process !== 'undefined' && process.env) {
    if (process.env.REACT_APP_API_BASE_URL) {
      config.apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    }

    if (
      process.env.NODE_ENV === 'development' ||
      process.env.REACT_APP_ENV === 'development'
    ) {
      config.environment = 'development';
    } else if (process.env.REACT_APP_ENV === 'staging') {
      config.environment = 'staging';
    }
  }

  return config;
};

export const config = getConfig();
