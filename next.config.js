/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules\/node-fetch\/lib\/index\.js/ },
      { file: /node_modules\/node-fetch\/lib\/index\.js/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
