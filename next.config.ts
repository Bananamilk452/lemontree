import { version } from "./package.json";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/home",
        permanent: true,
      },
    ];
  },
  env: {
    APP_VERSION: version,
  },
};

export default nextConfig;
