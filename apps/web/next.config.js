/** @type {import('next').NextConfig} */

const { version } = require("./package.json");

const remotePatterns = [
    {
        protocol: "https",
        hostname: "**",
    },
];

const nextConfig = {
    output: "standalone",
    env: {
        version,
    },
    reactStrictMode: false,
    typescript: {},
    images: {
        remotePatterns,
    },
    transpilePackages: [
        "@courselit/page-blocks",
        "@courselit/components-library",
    ],
    serverExternalPackages: [
        "pug",
        "liquidjs",
        "mongoose",
        "mongodb",
        "jsonwebtoken",
    ],
    experimental: {
    // Limit page-data workers on hosts that expose more CPUs than build RAM supports.
    cpus: 2,
  },
};

module.exports = nextConfig;
