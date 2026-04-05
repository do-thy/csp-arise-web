"use client";
import React, { useState, useEffect, useRef } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import { Search, ChevronDown, User, Maximize } from "lucide-react";

export default function AriseHomePage() {
  const { unityProvider, isLoaded, loadingProgression, requestFullscreen } = useUnityContext({
    loaderUrl: "/UnityBuild/sdca_virtual_tour.loader.js",
    dataUrl: "/UnityBuild/sdca_virtual_tour.data",
    frameworkUrl: "/UnityBuild/sdca_virtual_tour.framework.js",
    codeUrl: "/UnityBuild/sdca_virtual_tour.wasm",
  });

  // --- STATE MANAGEMENT ---
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState("Digital Campus");
  const [currentFloor, setCurrentFloor] = useState(0); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  const buildings = ["Digital Campus", "GD 1", "GD 2", "GD 3"];

  const floorMaps: Record<number, string> = {
    0: "/Maps/DigitalCampus/digital-campus-gf.png",
    1: "/Maps/DigitalCampus/digital-campus-2f.png",
    2: "/Maps/DigitalCampus/digital-campus-3f.png",
    3: "/Maps/DigitalCampus/digital-campus-4f.png",
  };

  // --- UNITY COMMUNICATION ---
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).OnFloorChanged = (floorLevel: number) => {
      console.log("Unity signal: Floor changed to", floorLevel);
      setCurrentFloor(floorLevel);
    };

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).OnFloorChanged;
    };
  }, []);

  // --- UI LOGIC ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener("contextmenu", handleContextMenu);
    return () => document.removeEventListener("contextmenu", handleContextMenu);
  }, []);

  const handleBuildingSelect = (name: string) => {
    setSelectedBuilding(name);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative h-screen w-screen bg-[#f0f0f0] overflow-hidden font-sans text-black">
      
      {/* --- TOP UI LAYER: SHARED HEADER ROW --- */}
      {/* This container spans the full width and uses flex-justify-between 
          to force the search to the left and account to the right. */}
      <div className="absolute top-6 left-0 w-full px-10 z-50 flex justify-between items-center pointer-events-auto">
        
        {/* LEFT SIDE: SEARCH & SELECTION */}
        <div className="flex flex-col gap-3 w-72 pl-4" ref={dropdownRef} style={{ transform: 'translateX(20px)' }}>
          <div className="flex items-center bg-white rounded border-2 border-black px-3 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Search size={18} className="mr-2 text-black" />
            <input 
              type="text" 
              placeholder="Room Search"
              className="bg-transparent outline-none text-sm font-bold w-full placeholder:text-black/30 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="relative">
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between bg-white rounded border-2 border-black px-3 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-gray-50 transition-all active:translate-y-0.5 active:shadow-none">
              <div className="flex items-center gap-2">
                <ChevronDown size={18} className={`transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                <span className="text-sm font-black uppercase tracking-tight">{selectedBuilding}</span>
              </div>
            </div>

            {isDropdownOpen && (
              <div className="absolute top-12 left-0 w-full bg-white border-2 border-black rounded shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden z-50">
                {buildings.map((name) => (
                  <div 
                    key={name}
                    onClick={() => handleBuildingSelect(name)}
                    className="px-4 py-2 text-sm font-bold border-b border-black last:border-none hover:bg-black hover:text-white cursor-pointer transition-colors"
                  >
                    {name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: ACCOUNT */}
        <div className="pointer-events-auto pr-4" style={{ transform: 'translateX(-20px)' }}>
          <button className="group flex flex-col items-center gap-1">
            <div className="w-12 h-12 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 transition-all active:translate-y-0.5 active:shadow-none">
              <User size={44} strokeWidth={2.5} className="text-black" />
            </div>
          </button>
        </div>
      </div>
      
      {/* --- CENTER: UNITY VIEW --- */}
      <div className="absolute inset-0 z-10">
        
        {/* LOADING OVERLAY - Fixed to center */}
        {!isLoaded && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f0f0f0]">
             <div className="flex flex-col items-center">
                <p className="mb-3 font-black uppercase tracking-[0.3em] text-[10px] text-black">
                  Initialising 3D Map
                </p>
                {/* Progress Bar Container */}
                <div className="w-64 h-4 bg-white border-2 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <div 
                     className="h-full bg-black transition-all duration-300 ease-out" 
                     style={{ width: `${loadingProgression * 100}%` }} 
                   />
                </div>
                <p className="mt-2 text-[9px] font-bold text-black/40 uppercase">
                  {Math.round(loadingProgression * 100)}% Complete
                </p>
             </div>
          </div>
        )}

        {/* UNITY CANVAS */}
        <Unity
          unityProvider={unityProvider}
          className="w-full h-full"
          style={{ visibility: isLoaded ? "visible" : "hidden" }}
        />
      </div>
      
      {/* --- BOTTOM LEFT: ENLARGED MINIMAP --- */}
      {/* FIX: Set width to 550px and height to 350px. Anchor strictly to bottom/left */}
      <div 
        className="absolute bottom-10 left-10 z-50 pointer-events-auto bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
        style={{ width: '400px', height: '300px' }} 
      >
        <div className="bg-black text-white px-3 py-2 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="bg-white text-black px-2 py-0.5 text-[9px] font-black uppercase">
              {selectedBuilding === "Digital Campus" ? `LVL ${currentFloor === 0 ? "GF" : `${currentFloor}F`}` : "MAP"}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">SDCA 2D Minimap</span>
          </div>
        </div>

        <div className="relative flex-1 bg-white overflow-hidden flex items-center justify-center">
          {isLoaded && (
            <img 
              src={floorMaps[currentFloor] || floorMaps[0]} 
              alt="Floor Plan"
              /* FIX: object-contain with minimal padding so it displays full-size within the box */
              className="w-full h-full object-contain p-2 transition-opacity duration-500"
            />
          )}
        </div>
      </div>

      {/* Fullscreen Button - Positioned next to the map on the bottom left */}
      {isLoaded && (
        <button 
          onClick={() => requestFullscreen(true)}
          className="absolute bottom-4 left-[420px] z-40 text-black/20 hover:text-black transition-colors"
        >
          <Maximize size={18} />
        </button>
      )}

    </div>
  );
}