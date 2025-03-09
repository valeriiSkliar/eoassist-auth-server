const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '.env.production') });

console.log(process.env.PROJECT_NAME);

module.exports = {
  apps: [
    {
      name: process.env.PROJECT_NAME,
      script: './build-and-start.js',
      // Remove args as we're handling port in build-and-start.js
      cwd: path.join(__dirname, ''),
      watch: ['all_locales'],
      watch_delay: 1000,
      restart_delay: 3000,
      ignore_watch: ['node_modules', '.next', 'out', 'public', 'dist'],
      post_update: ['npm run build'],
      pre_start: ['npm run build'],
      env_production: {
        NODE_ENV: 'production',
        PROJECT_NAME: process.env.PROJECT_NAME,
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
        LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        API_SERVER_URL: process.env.API_SERVER_URL,
        NEXT_PUBLIC_API_SERVER_URL: process.env.NEXT_PUBLIC_API_SERVER_URL,
        API_KEY: process.env.API_KEY,
        NEXT_PUBLIC_API_FRONTEND_URL: process.env.NEXT_PUBLIC_API_FRONTEND_URL,
        DOMAIN: process.env.DOMAIN,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXT_PUBLIC_AUTH_FRONTEND_URL: process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        ENV_DOMAIN: process.env.ENV_DOMAIN,
        PROTOCOL: process.env.PROTOCOL,
        NEXT_PUBLIC_ENV_DOMAIN: process.env.NEXT_PUBLIC_ENV_DOMAIN,
        NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
        YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
        YANDEX_CLIENT_SECRET: process.env.YANDEX_CLIENT_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
      env_development: {
        NODE_ENV: 'development',
        PROJECT_NAME: process.env.PROJECT_NAME,
        DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
        LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
        NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
        API_SERVER_URL: process.env.API_SERVER_URL,
        NEXT_PUBLIC_API_SERVER_URL: process.env.NEXT_PUBLIC_API_SERVER_URL,
        API_KEY: process.env.API_KEY,
        NEXT_PUBLIC_API_FRONTEND_URL: process.env.NEXT_PUBLIC_API_FRONTEND_URL,
        DOMAIN: process.env.DOMAIN,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXT_PUBLIC_AUTH_FRONTEND_URL: process.env.NEXT_PUBLIC_AUTH_FRONTEND_URL,
        ENV_DOMAIN: process.env.ENV_DOMAIN,
        PROTOCOL: process.env.PROTOCOL,
        NEXT_PUBLIC_ENV_DOMAIN: process.env.NEXT_PUBLIC_ENV_DOMAIN,
        NEXT_PUBLIC_PROTOCOL: process.env.NEXT_PUBLIC_PROTOCOL,
        AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
        AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
        YANDEX_CLIENT_ID: process.env.YANDEX_CLIENT_ID,
        YANDEX_CLIENT_SECRET: process.env.YANDEX_CLIENT_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      },
    },
  ],
};
