/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: {
      protocol: "http",
      hostname: "localhost",
      port: "8000", // Change this if your FastAPI runs on a different port
    },
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
