"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/configs/firebase";
import { signOut } from "firebase/auth";
import { toast, Toaster } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      //Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name,
        username: username,
        email: email,
        role: "user",
        provider: "email",
        photoURL: "",
      });

      await signOut(auth);
        toast.success("Account created successfully", {
          position: "top-center",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1000);

    } catch (error) {
      const firebaseError = error as { code?: string };

        if (firebaseError.code === "auth/invalid-email") {
          toast.error("Invalid email address", {
            position: "top-center",
          });

          return;
        }

        if (firebaseError.code === "auth/email-already-in-use") {
          toast.error("Email is already registered", {
            position: "top-center",
          });

          return;
        }

        if (firebaseError.code === "auth/weak-password") {
          toast.error("Password should be at least 6 characters", {
            position: "top-center",
          });

          return;
        }

        toast.error("Registration failed", {
          position: "top-center",
        });
      }
    };

    return (
      <div className="relative w-full h-screen overflow-hidden">

        {/* 🌫️ Blur overlay */}
        <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10" />

        {/* 🧩 Container */}
        <div className="relative z-20 flex items-center justify-center h-full">
          
          <div className="w-[90%] max-w-[750px] h-[550px] flex rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/20 bg-black/30 backdrop-blur-xl">
            
            <div className="flex-1 flex items-center justify-center p-10">
              <div className="w-full max-w-[360px] text-white">

                <h2 className="text-2xl font-semibold text-center mb-2">
                  Create Account
                </h2>
                <p className="text-sm text-white/60 text-center mb-6">
                  Register to continue
                </p>

                {/* Name */}
                <div className="mb-3">
                  <label className="text-sm text-white/70">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white focus:ring-2 focus:ring-[#A12124]"
                  />
                </div>

                {/* Username */}
                <div className="mb-3">
                  <label className="text-sm text-white/70">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white focus:ring-2 focus:ring-[#A12124]"
                  />
                </div>

                {/* Email */}
                <div className="mb-3">
                  <label className="text-sm text-white/70">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white focus:ring-2 focus:ring-[#A12124]"
                  />
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="text-sm text-white/70">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border border-white/40 text-white focus:ring-2 focus:ring-[#A12124]"
                  />
                </div>

                {/* Register Button */}
                <button
                  onClick={handleRegister}
                  className="w-full bg-[#A12124] hover:bg-[#811a1d] transition rounded-lg py-2 font-semibold mb-4"
                >
                  Register
                </button>

                {/* Back to Login */}
                <div className="text-center">
                  <Link href="/login">
                    <span className="text-sm text-white/70 hover:underline cursor-pointer">
                      Already have an account? Login
                    </span>
                  </Link>
                </div>

              </div>
            </div>

          </div>

        </div>
        
        <Toaster
          position="top-center"
          richColors
          theme="dark"
        />

      </div>
    );
}