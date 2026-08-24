import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // There is another lockfile further up in the home directory; pin the root
  // here so Next stops guessing which one owns this project.
  //
  // fileURLToPath, not url.pathname: on Linux a file URL's pathname is
  // "/vercel/path0/..." and trimming the leading slash makes it relative,
  // which Next then resolves against cwd into "/vercel/path0/vercel/path0".
  outputFileTracingRoot: path.dirname(fileURLToPath(import.meta.url)),
};

export default nextConfig;
