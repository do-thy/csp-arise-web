"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Navigation, Building2, AlertCircle, X } from "lucide-react";

export default function DirectionPage() {
  const [startRoom, setStartRoom] = useState("");
  const [targetRoom, setTargetRoom] = useState("");
  
  const [liveRooms, setLiveRooms] = useState<string[]>([]);
  const [startSuggestions, setStartSuggestions] = useState<string[]>([]);
  const [targetSuggestions, setTargetSuggestions] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const activeBuildingSlug = searchParams.get("from") || "maincampus";

  const buildingMap: { [key: string]: string } = {
    maincampus: "Main Campus",
    gd1: "GD 1",
    gd2: "GD 2",
    gd3: "GD 3",
    digicampus: "Digital Campus",
  };

  // Sync listener + Request data fallback if mounted late
  useEffect(() => {
    const handleIncomingRooms = (e: Event) => {
      const customEvent = e as CustomEvent;
      console.log("Rooms synchronized successfully:", customEvent.detail);
      setLiveRooms(customEvent.detail || []);
    };

    window.addEventListener("arise-sync-rooms", handleIncomingRooms);

    // FIX: Dispatches a global window event to layout.tsx -> Unity to re-trigger sync if missed
    const event = new CustomEvent("arise-keyboard", { detail: { capture: 1 } }); 
    // (Or use a dedicated custom event to call "RequestRoomSync" via layout.tsx if preferred)
    
    return () => window.removeEventListener("arise-sync-rooms", handleIncomingRooms);
  }, []);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const handleInputChange = (value: string, type: "start" | "target") => {
    if (type === "start") {
      setStartRoom(value);
      if (!value.trim()) {
        setStartSuggestions([]);
        return;
      }

      const filtered = liveRooms.filter(room => {
        const matchesSearch = room.toLowerCase().includes(value.toLowerCase()) && room !== value;
        if (activeBuildingSlug === "maincampus") return matchesSearch;
        
        // FIX: Remove spaces and match cleanly (e.g., "GD 1 Lobby" matches slug "gd1")
        const cleanRoom = room.toLowerCase().replace(/\s+/g, "");
        const cleanSlug = activeBuildingSlug.toLowerCase().replace(/\s+/g, "");
        return matchesSearch && cleanRoom.includes(cleanSlug);
      });
      setStartSuggestions(filtered);
    } else {
      setTargetRoom(value);
      if (!value.trim()) {
        setTargetSuggestions([]);
        return;
      }

      const filtered = liveRooms.filter(room => {
        const matchesSearch = room.toLowerCase().includes(value.toLowerCase()) && room !== value;
        if (activeBuildingSlug === "maincampus") return matchesSearch;
        
        const cleanRoom = room.toLowerCase().replace(/\s+/g, "");
        const cleanSlug = activeBuildingSlug.toLowerCase().replace(/\s+/g, "");
        return matchesSearch && cleanRoom.includes(cleanSlug);
      });
      setTargetSuggestions(filtered);
    }
  };

  const disableUnityKeyboard = () => {
    const event = new CustomEvent("arise-keyboard", { detail: { capture: 0 } });
    window.dispatchEvent(event);
  };

  const enableUnityKeyboard = () => {
    const event = new CustomEvent("arise-keyboard", { detail: { capture: 1 } });
    window.dispatchEvent(event);
  };

  const triggerNavigation = () => {
    const start = startRoom.trim();
    const target = targetRoom.trim();

    if (!start || !target) return;

    if (activeBuildingSlug !== "maincampus") {
      const cleanStart = start.toLowerCase().replace(/\s+/g, "");
      const cleanTarget = target.toLowerCase().replace(/\s+/g, "");
      const cleanSlug = activeBuildingSlug.toLowerCase().replace(/\s+/g, "");

      if (!cleanStart.includes(cleanSlug) || !cleanTarget.includes(cleanSlug)) {
        setToastMessage(`Inter-building pathing denied! Locations must strictly belong to ${buildingMap[activeBuildingSlug]}.`);
        return;
      }
    }

    const event = new CustomEvent("arise-navigation", {
      detail: { start, target },
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="absolute top-6 left-6 z-50 w-80 flex flex-col gap-3 text-black pointer-events-auto">
      {toastMessage && (
        <div className="fixed top-30 right-6 z-[9999] flex items-start gap-3 bg-[#facc15] text-black border-4 border-black p-4 rounded font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-sm">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-xs font-black uppercase tracking-tight">Navigation Guard</span>
            <p className="text-xs font-medium leading-tight">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-0.5 hover:bg-black/10 rounded shrink-0">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2 text-white">
          <Navigation size={20} className="text-[#A12124] fill-[#A12124]" /> Find Route
        </h2>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-black text-white text-xs font-bold uppercase tracking-wider w-fit border border-white/20">
          <Building2 size={12} /> {buildingMap[activeBuildingSlug] || "Main Campus"}
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-1 relative">
        <div className="relative flex flex-col">
          <div className="flex items-center bg-white rounded border-2 border-black px-3 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
            <MapPin size={16} className="mr-2 text-blue-600" />
            <input 
              type="text" 
              placeholder="Current Room (Start)"
              className="bg-transparent outline-none text-xs font-bold w-full"
              value={startRoom}
              onFocus={disableUnityKeyboard}
              onBlur={() => setTimeout(enableUnityKeyboard, 200)} 
              onChange={(e) => handleInputChange(e.target.value, "start")}
            />
          </div>
          
          {startSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-white border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30 max-h-40 overflow-y-auto">
              {startSuggestions.map((room) => (
                <div 
                  key={room}
                  onClick={() => {
                    setStartRoom(room);
                    setStartSuggestions([]);
                  }}
                  className="px-3 py-2 text-xs font-bold border-b border-gray-200 last:border-none hover:bg-black hover:text-white cursor-pointer"
                >
                  {room}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative flex flex-col">
          <div className="flex items-center bg-white rounded border-2 border-black px-3 h-10 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-20">
            <Navigation size={16} className="mr-2 text-red-600" />
            <input 
              type="text" 
              placeholder="Destination Room (Target)"
              className="bg-transparent outline-none text-xs font-bold w-full"
              value={targetRoom}
              onFocus={disableUnityKeyboard}
              onBlur={() => setTimeout(enableUnityKeyboard, 200)}
              onChange={(e) => handleInputChange(e.target.value, "target")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  triggerNavigation();
                  setTargetSuggestions([]);
                }
              }}
            />
            <button onClick={triggerNavigation} className="ml-2 p-1 hover:bg-black hover:text-white rounded transition">
              <Search size={16} />
            </button>
          </div>

          {targetSuggestions.length > 0 && (
            <div className="absolute top-11 left-0 w-full bg-white border-2 border-black rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-30 max-h-40 overflow-y-auto">
              {targetSuggestions.map((room) => (
                <div 
                  key={room}
                  onClick={() => {
                    setTargetRoom(room);
                    setTargetSuggestions([]);
                  }}
                  className="px-3 py-2 text-xs font-bold border-b border-gray-200 last:border-none hover:bg-black hover:text-white cursor-pointer"
                >
                  {room}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button 
        onClick={triggerNavigation}
        className="w-full h-10 bg-[#A12124] text-white font-bold rounded border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all uppercase tracking-wider text-xs z-10"
      >
        Calculate Path
      </button>
    </div>
  );
}