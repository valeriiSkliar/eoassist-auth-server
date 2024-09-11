 import withNextIntl from 'next-intl/plugin';

 const withNextIntlConfig = withNextIntl('./lib/i18n.ts');

// const withNextIntl = createNextIntlPlugin('next-intl.config.ts');

/** @type {import("next").NextConfig} */

const nextConfig = {
  output: "standalone",
  experimental: {
    allowedRevalidateHeaderKeys: ["X-Auth-Token", "x-forwarded-host"],
  }
}
export default withNextIntlConfig(nextConfig);


