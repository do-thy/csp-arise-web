import "../globals.css";
import Link from "next/link"; 

export const metadata = {
  title: "ARISE",
  description: "A cross-platform campus information system that integrates a 3D interactive map and augmented reality features to provide digital access to room information.",
};

import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400","500","600","700"],
});

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="main-container">
        {children}
      </div>        
  );
}