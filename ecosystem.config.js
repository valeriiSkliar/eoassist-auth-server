const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.production') });
module.exports = {
  apps: [
    {
      name: 'store-auth',
      script: './build-and-start.js',
      args: 'start',
      cwd: path.join(__dirname, ''),
      watch: ['all_locales'],
      watch_delay: 1000,
      restart_delay: 3000,
      ignore_watch: ['node_modules', '.next', 'out', 'public', 'dist'],
      post_update: ['npm run build'],
      pre_start: ['npm run build'],
      env_production: {
        NODE_ENV: 'production',
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
        LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        API_SERVER_URL: process.env.API_SERVER_URL,
        NEXT_PUBLIC_API_SERVER_URL: process.env.NEXT_PUBLIC_API_SERVER_URL,
        API_KEY: process.env.API_KEY,
        NEXT_PUBLIC_API_FRONTEND_URL: process.env.NEXT_PUBLIC_API_FRONTEND_URL,
        DOMAIN: process.env.DOMAIN,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXT_PUBLIC_AUTH_FRONTEND_URL:
          process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_FRONTEND_URL: process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        ENV_DOMAIN: process.env.ENV_DOMAIN,
        PROTOCOL: process.env.PROTOCOL,
        NEXT_PUBLIC_ENV_DOMAIN: process.env.NEXT_PUBLIC_ENV_DOMAIN,
        NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
      },
      env_development: {
        NODE_ENV: 'development',
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
        LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        API_SERVER_URL: process.env.API_SERVER_URL,
        NEXT_PUBLIC_API_SERVER_URL: process.env.NEXT_PUBLIC_API_SERVER_URL,
        API_KEY: process.env.API_KEY,
        NEXT_PUBLIC_API_FRONTEND_URL: process.env.NEXT_PUBLIC_API_FRONTEND_URL,
        DOMAIN: process.env.DOMAIN,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXT_PUBLIC_AUTH_FRONTEND_URL:
          process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        AUTH_SECRET: process.env.AUTH_SECRET,
        AUTH_FRONTEND_URL: process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        ENV_DOMAIN: process.env.ENV_DOMAIN,
        PROTOCOL: process.env.PROTOCOL,
        NEXT_PUBLIC_ENV_DOMAIN: process.env.NEXT_PUBLIC_ENV_DOMAIN,
        NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
      },
    },
  ],
};
