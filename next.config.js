/** @type {import("next").NextConfig} */
module.exports = {
  output: "standalone",
  experimental: {
    allowedRevalidateHeaderKeys: ["X-Auth-Token", "x-forwarded-host"],
    serverActions:{
      allowedOrigins: ["localhost:4000", "j3qv375z-4000.euw.devtunnels.ms"],
            // allowedForwardedHosts: ["localhost:3000"],

    }

  }
}
