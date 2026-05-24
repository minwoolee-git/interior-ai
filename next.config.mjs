import withPWAInit from "next-pwa";

const nextConfig = {
  reactStrictMode: true,
};

const withPWA = withPWAInit({
  dest: "public",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "ai-images",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60,
        },
      },
    },
  ],
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

export default withPWA(nextConfig);