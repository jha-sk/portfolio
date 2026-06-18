/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow loading dev assets when the page is opened via the LAN IP (not just
  // localhost) so /_next/* CSS + JS chunks aren't treated as cross-origin.
  allowedDevOrigins: ['192.168.1.3', '10.178.118.112'],
};

export default nextConfig;
