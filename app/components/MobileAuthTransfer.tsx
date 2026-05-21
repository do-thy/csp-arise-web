"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/configs/firebase";

export default function MobileAuthTransfer() {
  const searchParams = useSearchParams();
  const [handled, setHandled] = useState(false);

  useEffect(() => {
    const token = searchParams.get("mobileAuthToken");
    const redirect = searchParams.get("redirect") || window.location.pathname;
    if (!token || handled) return;

    const transferSession = async () => {
      try {
        const response = await fetch("/api/auth/transfer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (!response.ok || !data.customToken) {
          throw new Error(data.error || "Unable to transfer mobile auth session.");
        }

        await signInWithCustomToken(auth, data.customToken);

        const cleaned = new URL(window.location.href);
        cleaned.searchParams.delete("mobileAuthToken");
        cleaned.searchParams.delete("redirect");
        window.history.replaceState(null, "", cleaned.toString());
        window.location.replace(redirect);
      } catch (error) {
        console.error("Mobile auth transfer failed:", error);
      }
    };

    transferSession();
    setHandled(true);
  }, [searchParams, handled]);

  return null;
}
