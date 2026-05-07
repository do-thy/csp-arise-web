"use client";

import "../globals.css";
import Sidebar from "../components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Toaster } from "sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const formatBuilding = (name: string) => {
    if (name === "digicampus") return "DigiCampus";
    return name.toUpperCase(); // gd1 → GD1
  };

  //Dynamic title based on route
  const getTitle = () => {
    if (pathname === "/") return "Homepage";

    // 3D MAP
    if (pathname.startsWith("/map3d")) {
      const parts = pathname.split("/");
      const building = parts[2];

      if (building) {
        return `3D Map - ${formatBuilding(building)}`;
      }

      return "3D Map";
    }

    // 2D MAP
    if (pathname.startsWith("/map2d")) {
      const parts = pathname.split("/");
      const building = parts[2];

      if (building) {
        return `2D Map - ${formatBuilding(building)}`;
      }

      return "2D Map";
    }

    if (pathname.startsWith("/search")) return "Room Search";
    if (pathname.startsWith("/profile")) return "Profile";

    return "ARISE";
  };

  //Hide sidebar on homepage
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">

      <Sidebar />

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <div className="h-[80px] flex items-center justify-between px-8 
          bg-black/30 backdrop-blur-xl border-b border-white/10 text-white">

          {/* LEFT: PAGE TITLE */}
          <h1 className="text-xl font-semibold tracking-wide">
            {getTitle()}
          </h1>

          {/* RIGHT: (future area) */}
          <div className="flex items-center gap-4">

            {/* Placeholder circle (profile/avatar soon) */}
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm">
              U
            </div>

          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 bg-[#eeeeee] overflow-auto">
          {children}
        </div>

        <Toaster
          position="top-right"
          richColors
          theme="dark"
        />

      </div>
    </div>
  );
}