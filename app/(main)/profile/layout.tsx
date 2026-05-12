import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARISE | Profile",
  description: "Profile Account",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}