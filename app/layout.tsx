import "./globals.css";
import MobileAuthTransfer from "@/app/components/MobileAuthTransfer";
import { Suspense } from "react";

export const metadata = {
  title: "ARISE",
  description: "Campus System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={null}>
          <MobileAuthTransfer />
        </Suspense>
        {children}
      </body>
    </html>
  );
}