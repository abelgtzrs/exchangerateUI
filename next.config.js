/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make pdfjs work
    return config;
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/exchange-rate-manager",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
