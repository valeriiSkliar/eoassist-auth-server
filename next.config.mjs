 import withNextIntl from 'next-intl/plugin';

 const withNextIntlConfig = withNextIntl('./lib/i18n.ts');

// const withNextIntl = createNextIntlPlugin('next-intl.config.ts');

/** @type {import("next").NextConfig} */

const nextConfig = {
  // output: "standalone",
  async headers() {
    return [
      {
        source: '/(.*)', // Применяется ко всем маршрутам
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
          // {
          //   key: 'Cross-Origin-Embedder-Policy',
          //   value: 'require-corp',
          // },
        ],
      },
    ];
  },
  experimental: {
    allowedRevalidateHeaderKeys: ["X-Auth-Token", "x-forwarded-host"],
  }
}
export default withNextIntlConfig(nextConfig);


