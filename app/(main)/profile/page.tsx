"use client";

import Image from "next/image";
import { SignOut } from "../../components/AuthButton";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ChangePassword from "../../components/ChangePassword";

interface UserData {
  name: string;
  username: string;
  email: string;
  provider: string;
  role: string;
  photoURL?: string;
}

export default function ProfilePage() {

  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as UserData;
        setUserData(data);
      }
    }
  });

  return () => unsubscribe();
}, []);


  return (
    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] p-6 overflow-y-auto">

      {/* 🔷 PROFILE HEADER */}
      <div className="w-full bg-slate-800/80 border border-slate-700 shadow-md rounded-xl p-6 mb-6 flex items-center gap-4">
        
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold text-white">
            {userData?.photoURL ? (
              <Image
                src={userData.photoURL}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full object-cover"
              />
          ) : (
            userData?.username?.charAt(0).toUpperCase()
          )}
        </div>

        {/* User Info */}
        <div>
          <h2 className="text-xl font-semibold text-white">{userData?.username || "Loading..."}</h2>
          <p className="text-sm text-slate-400">{userData?.email || "Loading..."}</p>
          <span className="text-xs bg-[#A12124] px-2 py-1 rounded text-white mt-1 inline-block">
            user
          </span>
        </div>
      </div>

      {/* 🔷 MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* 🧾 ACCOUNT INFO */}
        <div className="bg-slate-800/80 border border-slate-700 shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Account Info</h3>

          <div className="space-y-2 text-sm">
            <p><span className="text-slate-400">Name:</span> <span className="text-slate-200">{userData?.name || "Loading..."}</span></p>
            <p><span className="text-slate-400">Username:</span> <span className="text-slate-200">{userData?.username || "Loading..."}</span></p>
            <p><span className="text-slate-400">Email:</span> <span className="text-slate-200">{userData?.email || "Loading..."}</span></p>
            <p><span className="text-slate-400">Provider:</span> <span className="text-slate-200">{userData?.provider || "Loading..."}</span></p>
          </div>
        </div>

        {/* 🔐 SECURITY */}
        <div className="bg-slate-800/80 border border-slate-700 shadow-md rounded-xl p-6">

          {userData?.provider === "email" ? (
            <ChangePassword />
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Security Settings</h3>

              <p className="text-slate-300 text-sm">
                You signed in using <span className="font-medium">Google</span>.
              </p>

              <p className="text-slate-400 text-sm">
                Password changes are handled by your Google account.
              </p>

              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                className="inline-block text-sm text-[#A12124] hover:underline"
              >
                Manage your Google password →
              </a>
            </div>
          )}

        </div>

      </div>

      {/* 🔴 ACTIONS */}
      <div className="mt-6 bg-slate-800/80 border border-slate-700 rounded-xl p-6 flex justify-between items-center">

        <div>
          <h3 className="text-white font-semibold">Account Actions</h3>
          <p className="text-slate-400 text-sm">
            Manage your account session
          </p>
        </div>

        <SignOut />

      </div>

    </div>
  );
}