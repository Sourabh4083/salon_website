/** @type {import('next').NextConfig} */
module.exports = {
  // A stray lockfile higher up the disk would otherwise be picked as the root.
  outputFileTracingRoot: __dirname,
  images: {
    // Product photos are uploaded through the admin form to Cloudinary.
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
};
