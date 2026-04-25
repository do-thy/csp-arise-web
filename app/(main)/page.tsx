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
    <div className="min-h-screen flex flex-col items-center justify-center text-white al">
      
      <h1 className="text-3xl font-bold mb-4 text-black/80">
        MIMIC HOMEPAGE
      </h1>

      <p className="mb-6 text-white/70">
        Logged in as: {user?.email}
      </p>

      <SignOut />

    </div>
  );
}