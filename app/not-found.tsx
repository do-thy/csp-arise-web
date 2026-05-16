"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase"; 

export default function NotFound() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleReturn = () => {
    if (isAuthenticated) {
      router.push("/map3d/maincampus");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-y-auto">
      
      {/* blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10" />

      {/* center container */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-6">
        
        <div className="
          w-full max-w-[600px]
          flex flex-col items-center justify-center
          p-8 md:p-12
          rounded-2xl overflow-hidden
          shadow-2xl shadow-black/40
          border border-white/20
          bg-black/30 backdrop-blur-xl
          text-center text-white
        ">
          
          {/* logo placeholder (matches login) */}
          <div className="w-[80px] h-[80px] md:w-[100px] md:h-[100px] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-6 flex items-center justify-center">
             <span className="text-4xl font-bold text-white/50">?</span>
          </div>

          {/* 404 text */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-widest mb-4">
            404
          </h1>
          
          <h2 className="text-xl md:text-2xl font-semibold mb-4">
            Destination Not Found
          </h2>

          <p className="text-sm md:text-base leading-relaxed text-white/70 mb-8 max-w-[400px]">
            The page or room you are looking for does not exist, has been moved or changed, or is outside the scope of ARISE.
          </p>

          {/* action Button */}
          <button
            onClick={handleReturn}
            disabled={isLoading}
            className="
              w-full max-w-[300px] 
              px-6 py-3 rounded-lg 
              bg-[#A12124] text-white font-semibold 
              hover:bg-[#8a1c1f] hover:scale-105 active:scale-95 
              transition-all duration-200 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              shadow-lg
            "
          >
            {isLoading 
              ? "Locating you..." 
              : isAuthenticated 
                ? "Return to Campus Map" 
                : "Return to Login"
            }
          </button>

        </div>
      </div>
    </div>
  );
}