import "./globals.css";
import MobileAuthTransfer from "@/app/components/MobileAuthTransfer";
import { Suspense } from "react";
import { Toaster } from "sonner";

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
          <Toaster
            position="top-center"
            richColors
            theme="dark"
          />
      </body>
    </html>
  );
}