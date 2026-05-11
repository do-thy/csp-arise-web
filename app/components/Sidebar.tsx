"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Map,
  Search,
  Route,
  Layers,
  User,
  Menu,
  Building2,
} from "lucide-react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const is3DRoute = pathname.startsWith("/map3d");

  const [manual3D, setManual3D] = useState<null | boolean>(null);

  // Final state
  const open3D = manual3D !== null ? manual3D : is3DRoute;

  const [collapsed, setCollapsed] = useState(false);

  const [show3DFloat, setShow3DFloat] = useState(false);


  const isActive = (path: string) => pathname === path;

  const isSubActive = (path: string) => pathname === path;

  const is3DActive = pathname.startsWith("/map3d");

  const closeAllDropdowns = () => {
    setShow3DFloat(false);
  };

  return (
    <div className={`${collapsed ? "w-[80px]" : "w-[240px]"} 
    bg-black/40 backdrop-blur-xl border-r border-white/10 
      flex flex-col text-white transition-all duration-300`}
    >

      {/* LOGO */}
      <div className="h-[80px] flex items-center justify-between px-4 border-b border-white/10">

        {!collapsed && (
          <span className="text-xl font-bold tracking-[4px]">ARISE</span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-md hover:bg-white/10 transition"
        >
          <Menu size={20} />
        </button>

      </div>

      <div className="flex flex-col mt-2 gap-1">
        
        {/* 3D MAP */}
        <button
          onClick={() => {
            if (collapsed) {
              setShow3DFloat(prev => !prev);
            } else {
              setManual3D(prev => (prev === null ? !is3DRoute : !prev));
            }
          }}
          className={`flex items-center justify-between py-3 px-4 mx-2 rounded-lg transition ${
            is3DActive
              ? "bg-[#A12124]/80 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-3">
            <Layers size={20} />
            {!collapsed && <span>Building Selection</span>}
          </div>

          {!collapsed && (
            <span className={`transition-transform ${open3D ? "rotate-180" : ""}`}>
              ▼
            </span>
          )}
        </button>

        {collapsed && show3DFloat && (
          <div className="absolute left-[80px] top-[88px] w-[180px]
            bg-black/90 backdrop-blur-xl border border-white/10
            rounded-lg shadow-lg p-2 z-50">

            <div className="px-3 py-1 text-xs text-white/40 uppercase text-center tracking-wider border-l-2 border-[#A12124]">
              Building Selection
            </div>

            {[
              { key: "maincampus", label: "Main Campus" },
              { key: "gd1", label: "GD1" },
              { key: "gd2", label: "GD2" },
              { key: "gd3", label: "GD3" },
              { key: "digicampus", label: "DigiCampus" },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => {
                  closeAllDropdowns();
                  router.push(`/map3d/${item.key}`);
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-white/80 hover:bg-white/10 hover:text-white"
              >
                {item.label}
              </button>
            ))}

          </div>
        )}
      

        {open3D && !collapsed && (
          <div className="flex flex-col mt-1 gap-1">
            {[
              { key: "maincampus", label: "Main Campus" },
              { key: "gd1", label: "GD1" },
              { key: "gd2", label: "GD2" },
              { key: "gd3", label: "GD3" },
              { key: "digicampus", label: "DigiCampus" },
            ].map((item) => (
              <button
                key={item.key}
                title={item.label}
                onClick={() => router.push(`/map3d/${item.key}`)}
                className={`flex items-center gap-3 py-2 pl-10 mx-2 rounded-md text-left text-sm transition ${
                  isSubActive(`/map3d/${item.key}`)
                    ? "bg-white/10 text-white"
                    : "text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Building2 size={16} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        )}

        {/*Direction*/}
        <button
          onClick={() => {
            closeAllDropdowns();
            router.push("/direction");
          }}
          className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg transition ${
            isActive("/direction")
              ? "bg-[#A12124]/80 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Route size={20} />
          {!collapsed && <span>Direction</span>}
        </button>

        {/* PROFILE */}
        <button
          onClick={() => {
            closeAllDropdowns();
            router.push("/profile");
          }}
          className={`flex items-center gap-3 py-3 px-4 mx-2 rounded-lg transition ${
            isActive("/profile")
              ? "bg-[#A12124]/80 text-white"
              : "text-white/70 hover:bg-white/10 hover:text-white"
          }`}
        >
          <User size={20} />
          {!collapsed && <span>Profile</span>}
        </button>

      </div>
    </div>
  );
}