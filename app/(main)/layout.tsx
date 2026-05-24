"use client";

import "../globals.css";
import Sidebar from "../components/Sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Unity, useUnityContext } from "react-unity-webgl";
import { useEffect, useRef } from "react";

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

  // Remembers the last active building slug across routing swaps
  const lastActiveBuilding = useRef("maincampus");

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
      if (building) return `3D Map - ${formatBuilding(building)}`;
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
      
      lastActiveBuilding.current = buildingParam; // Remember it!
      const activeIndex = slugOrder.indexOf(buildingParam);
      
      if (activeIndex !== -1) {
        sendMessage("BuildingManager", "SetBuildingVisible", activeIndex);
        sendMessage("NavigationTest", "set_buildingFilter", buildingParam);
      }
    }
  }, [pathname, isLoaded, is3DRoute]);

  // Bind a global browser listener function that Unity can talk to directly
  useEffect(() => {
    // Bind the function immediately to window object
    window.SendRoomsToWeb = (jsonString: string) => {
      try {
        console.log("[ARISE Bridge] Raw payload received from Unity:", jsonString);
        
        const data = JSON.parse(jsonString);
        
        if (data && data.rooms) {
          // Dispatch the dynamic list directly down to your Direction inputs
          const event = new CustomEvent("arise-sync-rooms", { detail: data.rooms });
          window.dispatchEvent(event);
          console.log(`[ARISE Bridge] Successfully synced ${data.rooms.length} nodes to frontend!`);
        } else {
          console.warn("[ARISE Bridge] Parsed JSON format was unexpected:", data);
        }
      } catch (err) {
        console.error("[ARISE Bridge] Failed to process Unity room packet registration:", err);
      }
    };

    // Keep it active across renders, clean up only on unmount
    return () => {
      delete window.SendRoomsToWeb;
    };
  }, []); // Empty array keeps this listener alive and unbothered by re-renders!

  useEffect(() => {
    const handleNavRequest = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (isLoaded) {
        sendMessage("NavigationTest", "set_startRoomName", customEvent.detail.start);
        sendMessage("NavigationTest", "set_targetRoomName", customEvent.detail.target);
        sendMessage("NavigationTest", "RunPlacardTest");
      }
    };

    const handleKeyboardRequest = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (isLoaded) {
        sendMessage("NavigationTest", "SetKeyboardCapture", customEvent.detail.capture);
      }
    };

    // FIX: Tells Unity to release keystrokes when HTML input textfields gain focus
    const handleDocumentFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (isLoaded && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        sendMessage("NavigationTest", "SetKeyboardCapture", 0);
      }
    };

    // FIX: Restores Unity's keyboard focus when clicking away from input panels
    const handleDocumentBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (isLoaded && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
        sendMessage("NavigationTest", "SetKeyboardCapture", 1);
      }
    };

    window.addEventListener("arise-navigation", handleNavRequest);
    window.addEventListener("arise-keyboard", handleKeyboardRequest);
    document.addEventListener("focusin", handleDocumentFocus);
    document.addEventListener("focusout", handleDocumentBlur);
    
    return () => {
      window.removeEventListener("arise-navigation", handleNavRequest);
      window.removeEventListener("arise-keyboard", handleKeyboardRequest);
      document.removeEventListener("focusin", handleDocumentFocus);
      document.removeEventListener("focusout", handleDocumentBlur);
    };
  }, [isLoaded]);

  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="flex w-screen h-screen overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col relative">
        {/* TOP BAR */}
        <div className="h-[80px] flex items-center justify-between px-8 bg-black/30 backdrop-blur-xl border-b border-white/10 text-white z-40">
          <h1 className="text-xl font-semibold tracking-wide">{getTitle()}</h1>
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sm">
              U
            </div>
          </div>
        </div>

        {/* MAIN VISUAL WORKSPACE VIEWPORT */}
        <div className="flex-1 relative bg-[#eeeeee] overflow-auto">
          
          {/* Overlay UI Layer */}
          {/* FIX 1: Toggles pointer events natively so profile page captures mouse inputs naturally */}
          <div 
            className={`absolute inset-0 z-30 ${
              showUnity ? "pointer-events-none" : "pointer-events-auto"
            }`}
          >
            {children}
          </div>

          {/* Underlayer Unity canvas engine block */}
          {/* FIX 2: Added 'block' vs 'hidden' along with visibility variables */}
          <div 
            className={`absolute inset-0 transition-opacity duration-300 ${
              showUnity 
                ? "opacity-100 z-10 pointer-events-auto block" 
                : "opacity-0 z-0 pointer-events-none hidden"
            }`}
          >
            <Unity unityProvider={unityProvider} className="w-full h-full" />
          </div>

        </div>

      </div>
    </div>
  );
}