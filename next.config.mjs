import path from "node:path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // There is another lockfile further up in the home directory; pin the root
  // here so Next stops guessing which one owns this project.
  outputFileTracingRoot: path.dirname(new URL(import.meta.url).pathname.slice(1)),
};

export default nextConfig;
