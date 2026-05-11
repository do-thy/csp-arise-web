"use client";

import "../globals.css";
import Sidebar from "../components/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const formatBuilding = (name: string) => {
    if (name === "digicampus") return "DigiCampus";
    if (name === "maincampus") return "Main Campus";
    
    // Check if it's gd1, gd2, etc., and turn it into GD 1, GD 2
    if (name.startsWith("gd")) {
      return `GD ${name.replace("gd", "")}`;
    }
    
    return name.toUpperCase();
  };

  const getPageName = () => {
    // 3D MAP
    if (pathname.startsWith("/map3d")) {
      const parts = pathname.split("/");
      const building = parts[2];

      if (building) {
        return formatBuilding(building);
      }

      return "3D Map";
    }

    if (pathname.startsWith("/direction")) return "Direction";
    if (pathname.startsWith("/profile")) return "Profile";

    return "";
  };

  // Logic specifically for the browser tab title
  const getTabTitle = () => {
    const pageName = getPageName();
    return pageName ? `ARISE | ${pageName}` : "ARISE";
  };

  // Set dynamic page title
  useEffect(() => {
    document.title = getTabTitle();
  }, [pathname]);

  // Hide sidebar on homepage
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="h-20 flex items-center justify-between px-8 
          bg-black/30 backdrop-blur-xl border-b border-white/10 text-white">

          {/* LEFT: PAGE TITLE */}
          <h1 className="text-xl font-semibold tracking-wide">
            {getPageName() || "ARISE"}
          </h1>

          {/* RIGHT: (future area) */}
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm">
              U
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-[#eeeeee] overflow-auto">
          {children}
        </div>

      </div>
    </div>
  );
}