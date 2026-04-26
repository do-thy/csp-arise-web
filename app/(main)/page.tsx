"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { SignOut } from "../components/AuthButton";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.replace("/login"); // 🔒 protect route
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) return null;

    return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* 🌫️ Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10" />

      {/* 🧩 CENTER CONTAINER */}
      <div className="relative z-20 flex items-center justify-center h-full">

        <div className="w-[90%] max-w-[1100px] h-[700px] flex flex-col items-center justify-center rounded-2xl shadow-2xl shadow-black/40 border border-white/20 bg-black/30 backdrop-blur-xl">

          {/* TITLE */}
          <h1 className="text-[70px] font-extrabold tracking-[6px] text-white mb-10">
            ARISE
          </h1>

          {/* BUTTONS */}
          <div className="flex flex-col gap-5">

            <button
              onClick={() => router.push("/map3d/digicampus")}
              className="px-10 py-3 rounded-full bg-[#A12124] hover:bg-[#811a1d] hover:scale-105 hover:text-white transition text-lg border border-white/20"
            >
              3D MAP
            </button>

            <button
              onClick={() => router.push("/map2d/digicampus")}
              className="px-10 py-3 rounded-full bg-[#A12124] hover:bg-[#811a1d] hover:scale-105 hover:text-white transition text-lg border border-white/20"
            >
              2D MAP
            </button>

            <button
              onClick={() => router.push("/search")}
              className="px-10 py-3 rounded-full bg-[#A12124] hover:bg-[#811a1d] hover:scale-105 hover:text-white transition text-lg border border-white/20"
            >
              ROOM SEARCH
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}