import type { NextConfig } from "next";
import os from "os";

// Helper function to dynamically grab local IPv4 addresses
function getLocalIPv4Addresses() {
  const interfaces = os.networkInterfaces();
  const addresses: string[] = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
      if (net.family === "IPv4" && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  
  return addresses;
}

const nextConfig: NextConfig = {
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  // Automatically allow localhost and all local IPs assigned to this machine
  allowedDevOrigins: [
    "localhost",
    ...getLocalIPv4Addresses(),
  ],
};

export default nextConfig;