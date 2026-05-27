"use client";

import "../globals.css";
import Sidebar from "../components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useEffect, useRef, useState } from "react";

import { Menu } from "lucide-react";

import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/configs/firebase";

declare global {
  interface Window {
    SendRoomsToWeb?: (jsonString: string) => void;
  }
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // ✅ AUTH STATES
  const [authorized, setAuthorized] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Remembers the last active building slug across routing swaps
  const lastActiveBuilding = useRef("maincampus");

  // ✅ FIREBASE AUTH GUARD
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/login");
      } else {
        setAuthorized(true);
      }

      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  const { unityProvider, isLoaded, sendMessage } = useUnityContext({
    loaderUrl: "/unity-build/sdca_virtual_tour.loader.js",
    dataUrl: "/unity-build/sdca_virtual_tour.data",
    frameworkUrl: "/unity-build/sdca_virtual_tour.framework.js",
    codeUrl: "/unity-build/sdca_virtual_tour.wasm",
  });

  const slugOrder = ["maincampus", "gd1", "gd2", "gd3", "digicampus"];

  const is3DRoute = pathname.startsWith("/map3d");

  const isDirectionRoute = pathname.startsWith("/direction");

  // Keep Unity running visibly behind both the interactive map view and directional input layouts
  const showUnity = is3DRoute || isDirectionRoute;

  const formatBuilding = (name: string) => {
    if (name === "digicampus") return "DigiCampus";

    if (name === "maincampus") return "Main Campus";

    return name.toUpperCase();
  };

  const getTitle = () => {
    if (is3DRoute) {
      const parts = pathname.split("/");

      const building = parts[2];

      if (building) {
        return `3D Map - ${formatBuilding(building)}`;
      }

      return "3D Map";
    }

    if (isDirectionRoute) return "Direction";

    if (pathname.startsWith("/profile")) return "Profile";

    return "ARISE";
  };

  // Intercept Direction page clicks to include our active search parameter tracking string context
  useEffect(() => {
    if (isDirectionRoute && !window.location.search.includes("from=")) {
      router.replace(`/direction?from=${lastActiveBuilding.current}`);
    }
  }, [pathname, isDirectionRoute]);

  // Sync state loops talking directly to Unity's backend hooks
  useEffect(() => {
    if (isLoaded && is3DRoute) {
      const parts = pathname.split("/");

      const buildingParam = parts[2] || "maincampus";

      lastActiveBuilding.current = buildingParam;

      const activeIndex = slugOrder.indexOf(buildingParam);

      if (activeIndex !== -1) {
        sendMessage(
          "BuildingManager",
          "SetBuildingVisible",
          activeIndex
        );

        sendMessage(
          "NavigationTest",
          "set_buildingFilter",
          buildingParam
        );
      }
    }
  }, [pathname, isLoaded, is3DRoute]);

  // Bind a global browser listener function that Unity can talk to directly
  useEffect(() => {
    window.SendRoomsToWeb = (jsonString: string) => {
      try {
        console.log(
          "[ARISE Bridge] Raw payload received from Unity:",
          jsonString
        );

        const data = JSON.parse(jsonString);

        if (data && data.rooms) {
          const event = new CustomEvent("arise-sync-rooms", {
            detail: data.rooms,
          });

          window.dispatchEvent(event);

          console.log(
            `[ARISE Bridge] Successfully synced ${data.rooms.length} nodes to frontend!`
          );
        } else {
          console.warn(
            "[ARISE Bridge] Parsed JSON format was unexpected:",
            data
          );
        }
      } catch (err) {
        console.error(
          "[ARISE Bridge] Failed to process Unity room packet registration:",
          err
        );
      }
    };

    return () => {
      delete window.SendRoomsToWeb;
    };
  }, []);

  useEffect(() => {
    const handleNavRequest = (e: Event) => {
      const customEvent = e as CustomEvent;

      if (isLoaded) {
        sendMessage(
          "NavigationTest",
          "set_startRoomName",
          customEvent.detail.start
        );

        sendMessage(
          "NavigationTest",
          "set_targetRoomName",
          customEvent.detail.target
        );

        sendMessage(
          "NavigationTest",
          "RunPlacardTest"
        );
      }
    };

    const handleKeyboardRequest = (e: Event) => {
      const customEvent = e as CustomEvent;

      if (isLoaded) {
        sendMessage(
          "NavigationTest",
          "SetKeyboardCapture",
          customEvent.detail.capture
        );
      }
    };

    // Release keyboard when typing in HTML inputs
    const handleDocumentFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (
        isLoaded &&
        (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA"
        )
      ) {
        sendMessage(
          "NavigationTest",
          "SetKeyboardCapture",
          0
        );
      }
    };

    // Restore keyboard focus back to Unity
    const handleDocumentBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;

      if (
        isLoaded &&
        (
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA"
        )
      ) {
        sendMessage(
          "NavigationTest",
          "SetKeyboardCapture",
          1
        );
      }
    };

    window.addEventListener(
      "arise-navigation",
      handleNavRequest
    );

    window.addEventListener(
      "arise-keyboard",
      handleKeyboardRequest
    );

    document.addEventListener(
      "focusin",
      handleDocumentFocus
    );

    document.addEventListener(
      "focusout",
      handleDocumentBlur
    );

    return () => {
      window.removeEventListener(
        "arise-navigation",
        handleNavRequest
      );

      window.removeEventListener(
        "arise-keyboard",
        handleKeyboardRequest
      );

      document.removeEventListener(
        "focusin",
        handleDocumentFocus
      );

      document.removeEventListener(
        "focusout",
        handleDocumentBlur
      );
    };
  }, [isLoaded]);

  // ✅ WAIT UNTIL AUTH CHECK FINISHES
  if (loadingAuth) {
    return null;
  }

  // ✅ BLOCK UNAUTHORIZED USERS
  if (!authorized) {
    return null;
  }

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">

      {/* SIDEBAR */}
      <Sidebar />

      <div className="flex-1 flex flex-col relative">

        {/* TOP BAR */}
        <div className="h-[70px] sm:h-[80px] flex items-center justify-between px-4 sm:px-8 bg-black/30 backdrop-blur-xl border-b border-white/10 text-white z-40">

          <div className="flex items-center gap-3">

            {/* MOBILE HAMBURGER */}
            <button
              className="hidden max-[499px]:flex w-10 h-10 items-center justify-center rounded-md bg-black/20 hover:bg-white/10 transition"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("arise-mobile-sidebar")
                );
              }}
            >
              <Menu size={22} />
            </button>

            {/* PAGE TITLE */}
            <h1 className="text-base sm:text-xl font-semibold tracking-wide leading-tight">
              {getTitle()}
            </h1>

          </div>

          {/* USER */}
          <div className="flex items-center gap-2 sm:gap-4">

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs sm:text-sm">
              U
            </div>

          </div>

        </div>

        {/* MAIN VISUAL WORKSPACE VIEWPORT */}
        <div className="flex-1 relative bg-[#eeeeee] overflow-auto">

          {/* Overlay UI Layer */}
          <div
            className={`absolute inset-0 z-30 ${
              showUnity
                ? "pointer-events-none"
                : "pointer-events-auto"
            }`}
          >
            {children}
          </div>

          {/* Unity Layer */}
          <div
            className={`absolute inset-0 transition-opacity duration-300 ${
              showUnity
                ? "opacity-100 z-10 pointer-events-auto block"
                : "opacity-0 z-0 pointer-events-none hidden"
            }`}
          >

            <Unity
              unityProvider={unityProvider}
              className="w-full h-full"
            />

          </div>

        </div>

      </div>

    </div>
  );
}