"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
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

  const open3D = manual3D !== null ? manual3D : is3DRoute;

  const [collapsed, setCollapsed] = useState(false);

  const [isMobile499, setIsMobile499] = useState(false);

  const [show3DFloat, setShow3DFloat] = useState(false);

  /* RESPONSIVE DETECTION */
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 499;

      setIsMobile499(mobile);

      // RESET STATE WHEN ENTERING MOBILE
      if (mobile) {
        setCollapsed(false);
        setShow3DFloat(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* MOBILE HAMBURGER EVENT */
  useEffect(() => {
    const openSidebar = () => {
      if (window.innerWidth <= 499) {
        setCollapsed(prev => !prev);
      }
    };

    window.addEventListener(
      "arise-mobile-sidebar",
      openSidebar as EventListener
    );

    return () => {
      window.removeEventListener(
        "arise-mobile-sidebar",
        openSidebar as EventListener
      );
    };
  }, []);

  const isActive = (path: string) => pathname === path;

  const isSubActive = (path: string) => pathname === path;

  const is3DActive = pathname.startsWith("/map3d");

  const closeAllDropdowns = () => {
    setShow3DFloat(false);
  };

  const finalCollapsed = isMobile499 ? true : collapsed;

  return (
    <>
      {/* SIDEBAR */}
      <div
        className={`
          ${
            isMobile499
              ? "w-0"
              : finalCollapsed
              ? "w-[72px]"
              : "w-[190px] sm:w-[220px] md:w-[240px]"
          }

          ${
            isMobile499
              ? "bg-transparent border-none"
              : "bg-black/40 backdrop-blur-xl border-r border-white/10"
          }

          flex flex-col text-white transition-all duration-300
          relative z-50 h-full overflow-visible
        `}
      >

        {/* DESKTOP TOP */}
        {!isMobile499 && (
          <div className="h-[70px] sm:h-[80px] flex items-center justify-between px-3 sm:px-4 border-b border-white/10">

            {!finalCollapsed && (
              <span className="text-lg sm:text-xl font-bold tracking-[3px] sm:tracking-[4px]">
                ARISE
              </span>
            )}

            <button
              onClick={() => {
                setCollapsed(prev => !prev);
                setShow3DFloat(false);
              }}
              className="
                w-10 h-10
                flex items-center justify-center
                rounded-md
                hover:bg-white/10
                transition
                bg-black/20
              "
            >
              <Menu size={22} />
            </button>

          </div>
        )}

        {/* SIDEBAR CONTENT */}
        <div
          className={`
            ${
              isMobile499
                ? collapsed
                  ? "absolute top-[72px] left-0 w-[220px]"
                  : "hidden"
                : "flex flex-col mt-2"
            }

            gap-1
            z-50

            ${
              isMobile499
                ? "bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl"
                : ""
            }
          `}
        >

          {/* BUILDING SELECTION */}
          <div className="relative">

            <button
              onClick={() => {
                if (finalCollapsed || isMobile499) {
                  setShow3DFloat(prev => !prev);
                } else {
                  setManual3D(prev =>
                    prev === null ? !is3DRoute : !prev
                  );
                }
              }}
              className={`w-full flex items-center justify-between py-3 px-3 sm:px-4 rounded-xl transition ${
                is3DActive
                  ? "bg-[#A12124]/80 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >

              <div className="flex items-center gap-3">
                <Layers size={20} />

                {!finalCollapsed && !isMobile499 && (
                  <span className="text-sm sm:text-base">
                    Building Selection
                  </span>
                )}

                {isMobile499 && (
                  <span className="text-sm">
                    Building Selection
                  </span>
                )}
              </div>

              {(isMobile499 || (!finalCollapsed && !isMobile499)) && (
                <span
                  className={`text-xs transition-transform ${
                    open3D || show3DFloat ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              )}

            </button>

            {/* MOBILE DROPDOWN MENU */}
            {isMobile499 && show3DFloat && (
              <div
                className="
                  mt-2
                  w-full
                  bg-black/90 backdrop-blur-xl
                  border border-white/10
                  rounded-xl shadow-2xl
                  p-3 z-50
                "
              >

                <div className="px-2 py-1 mb-2 text-[10px] text-white/40 uppercase tracking-wider border-l-2 border-[#A12124]">
                  Building Selection
                </div>

                <div className="flex flex-col gap-1">

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
                        setCollapsed(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      {item.label}
                    </button>
                  ))}

                </div>

              </div>
            )}

            {/* DESKTOP COLLAPSED FLOATING MENU */}
            {!isMobile499 && finalCollapsed && show3DFloat && (
              <div
                className="
                  absolute left-[80px] top-0
                  w-[180px]
                  bg-black/90 backdrop-blur-xl
                  border border-white/10
                  rounded-xl shadow-2xl
                  p-3 z-50
                "
              >

                <div className="px-2 py-1 mb-2 text-[10px] text-white/40 uppercase tracking-wider border-l-2 border-[#A12124]">
                  Building Selection
                </div>

                <div className="flex flex-col gap-1">

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
                      className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10 hover:text-white transition"
                    >
                      {item.label}
                    </button>
                  ))}

                </div>

              </div>
            )}

          </div>

          {/* DESKTOP SUBMENU */}
          {open3D && !finalCollapsed && !isMobile499 && (
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
                  className={`flex items-center gap-3 py-2 pl-10 rounded-md text-left text-sm transition ${
                    isSubActive(`/map3d/${item.key}`)
                      ? "bg-white/10 text-white"
                      : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Building2 size={15} />
                  <span>{item.label}</span>
                </button>
              ))}

            </div>
          )}

          {/* DIRECTION */}
          <button
            onClick={() => {
              closeAllDropdowns();
              router.push("/direction");

              if (isMobile499) {
                setCollapsed(false);
              }
            }}
            className={`w-full flex items-center gap-3 py-3 px-3 sm:px-4 rounded-xl transition ${
              isActive("/direction")
                ? "bg-[#A12124]/80 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >

            <Route size={20} />

            {(!finalCollapsed && !isMobile499) || isMobile499 ? (
              <span className="text-sm sm:text-base">
                Direction
              </span>
            ) : null}

          </button>

          {/* PROFILE */}
          <button
            onClick={() => {
              closeAllDropdowns();
              router.push("/profile");

              if (isMobile499) {
                setCollapsed(false);
              }
            }}
            className={`w-full flex items-center gap-3 py-3 px-3 sm:px-4 rounded-xl transition ${
              isActive("/profile")
                ? "bg-[#A12124]/80 text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white"
            }`}
          >

            <User size={20} />

            {(!finalCollapsed && !isMobile499) || isMobile499 ? (
              <span className="text-sm sm:text-base">
                Profile
              </span>
            ) : null}

          </button>

        </div>

      </div>
    </>
  );
}