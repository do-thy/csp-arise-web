import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ARISE | Register",
  description: "Create a new ARISE account.",
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}