"use client";

import Image from "next/image";
import google from "@/public/google.png";
import admin from "@/public/admin.png";
import { signIn, signOut } from "next-auth/react";

/* wewewewewwewewe */

export function SignIn() {
  return (
    <button
      onClick={() =>
        signIn("google")
      }
      className="w-65 py-3 rounded-xl border border-[#e5bcbc] bg-[#f4cfcf] flex items-center justify-center gap-2 font-normal hover:bg-[#e9bcbc] transition"
    >
      <Image src={google} alt="Google" width={18} height={18} />
      Continue with Google
    </button>
  );
}


export function AdminSignInButton() {
  return (
    <button 
      className="w-65 mt-3 py-3 rounded-xl bg-[#f4cfcf] flex items-center justify-center gap-2 font-normal hover:bg-[#e9bcbc] transition">
      <Image src={admin} alt="Admin" width={18} height={18} />
      Continue as Admin
    </button>
  );
} 

export function SignOut() {
  return (
    <button
      onClick={() => signOut({ redirectTo: "/login" })}
      className="w-auto py-3 px-3 rounded-xl border border-[#e5bcbc] bg-[#f4cfcf] flex items-center justify-center gap-2 font-normal text-lg hover:bg-[#e9bcbc] transition"
    >
      SIGN OUT
    </button>
  );
}