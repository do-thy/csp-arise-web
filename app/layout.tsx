import "./globals.css";
import MobileAuthTransfer from "@/app/components/MobileAuthTransfer";

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
        <MobileAuthTransfer />
        {children}
      </body>
    </html>
  );
}