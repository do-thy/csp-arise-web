"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/configs/firebase";
import { SignIn, LoginButton } from "../../components/AuthButton";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/map3d/digicampus");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="relative w-full min-h-screen overflow-y-auto">

      {/* 🌫️ Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10" />

      {/* 🧩 CENTER CONTAINER */}
      <div className="relative z-20 flex items-center justify-center min-h-screen px-4 py-6">
        
        <div className="
          w-full max-w-[1100px]
          flex flex-col md:flex-row
          rounded-2xl overflow-hidden
          shadow-2xl shadow-black/40
          border border-white/20
          bg-black/30 backdrop-blur-xl
        ">

          {/* LEFT SIDE */}
          <div className="
            w-full md:flex-1
            flex items-center justify-center
            p-6 md:p-10
            min-h-[300px]
            border-b md:border-b-0 md:border-r border-white/10
          ">
            <div className="text-center text-white max-w-[400px]">

              <div className="w-[100px] h-[100px] md:w-[120px] md:h-[120px] bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mx-auto mb-4 md:mb-6" />

              <h1 className="text-3xl md:text-5xl font-extrabold tracking-widest mb-3 md:mb-4">
                ARISE
              </h1>

              <p className="text-sm md:text-lg leading-relaxed text-white/70">
                Explore your campus in 3D. Navigate, scan, and discover rooms using AR technology.
              </p>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="
            w-full md:flex-1
            flex items-center justify-center
            p-6 md:p-10
            min-h-[400px]
          ">
            <div className="w-full max-w-[360px] text-white">

              <h2 className="text-xl md:text-2xl font-semibold text-center mb-2">
                Continue with ARISE
              </h2>

              <p className="text-xs md:text-sm text-white/60 text-center mb-6">
                Sign in to access your account
              </p>

              {/* Role Selection */}
              <div className="flex justify-center gap-4 md:gap-6 mb-6 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={role === "user"}
                    onChange={() => setRole("user")}
                    className="accent-[#A12124]"
                  />
                  <span className="text-xs md:text-sm text-white/80">As User</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={role === "admin"}
                    onChange={() => setRole("admin")}
                    className="accent-[#A12124]"
                  />
                  <span className="text-xs md:text-sm text-white/80">As Admin</span>
                </label>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="text-xs md:text-sm text-white/70">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#A12124]"
                />
              </div>

              {/* Password */}
              <div className="mb-2">
                <label className="text-xs md:text-sm text-white/70">Password</label>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#A12124]"
                />
              </div>

              <div className="flex justify-between mb-4">
                <Link href="/register">
                  <span className="text-xs text-[#f36062] cursor-pointer hover:underline">
                    Register?
                  </span>
                </Link>

                <Link href="/forgot-password">
                  <span className="text-xs text-[#f36062] cursor-pointer hover:underline">
                    Forgot password?
                  </span>
                </Link>
              </div>

              {/* Login Button */}
              <LoginButton role={role} email={email} password={password} />

              {/* Divider */}
              <div className="flex items-center gap-2 my-4">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-xs text-white/50">OR</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Google Sign In */}
              <div className="hover:scale-105 active:scale-95 transition">
                <SignIn />
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}