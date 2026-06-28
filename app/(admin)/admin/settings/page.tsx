"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/configs/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import ChangePassword from "../../../components/ChangePassword";
import { SignOut } from "../../../components/AuthButton";

interface AdminData {
  name: string;
  username: string;
  email: string;
  provider: string;
  role: string;
  photoURL?: string;
}

export default function AdminSettingsPage() {
  const [adminData, setAdminData] = useState<AdminData | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as AdminData;
          setAdminData(data);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full h-full p-6 overflow-y-auto">
      {/* 🔷 SETTINGS HEADER */}
      <div className="w-full bg-white border border-slate-200 shadow-md rounded-xl p-6 mb-6 flex items-center gap-4">
        
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-700">
          {adminData?.photoURL ? (
            <Image
              src={adminData.photoURL}
              alt="avatar"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
          ) : (
            adminData?.username?.charAt(0).toUpperCase()
          )}
        </div>

        {/* Admin Info */}
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{adminData?.username || "Loading..."}</h2>
          <p className="text-sm text-slate-500">{adminData?.email || "Loading..."}</p>
          <span className="text-xs bg-[#A12124] px-2 py-1 rounded text-white mt-1 inline-block">
            admin
          </span>
        </div>
      </div>

      {/* 🔷 MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* 🧾 ACCOUNT INFO */}
        <div className="bg-white border border-slate-200 shadow-md rounded-xl p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Account Info</h3>

          <div className="space-y-2 text-sm text-slate-600">
            <p><span className="text-slate-500">Name:</span> <span className="text-slate-900">{adminData?.name || "Loading..."}</span></p>
            <p><span className="text-slate-500">Username:</span> <span className="text-slate-900">{adminData?.username || "Loading..."}</span></p>
            <p><span className="text-slate-500">Email:</span> <span className="text-slate-900">{adminData?.email || "Loading..."}</span></p>
            <p><span className="text-slate-500">Provider:</span> <span className="text-slate-900">{adminData?.provider || "Loading..."}</span></p>
            <p><span className="text-slate-500">Role:</span> <span className="text-slate-900">{adminData?.role || "Loading..."}</span></p>
          </div>
        </div>

        {/* 🔐 SECURITY */}
        <div className="bg-white border border-slate-200 shadow-md rounded-xl p-6">
          {adminData?.provider === "email" ? (
            /* Targeting the elements inside ChangePassword directly from here 
              using Tailwind's arbitrary children selectors to override the dark styles.
            */
            <div className="[&_h4]:!text-slate-900 [&_input]:!bg-slate-50 [&_input]:!text-slate-900 [&_input]:border [&_input]:border-slate-200 [&_input]:placeholder-slate-400">
              <ChangePassword />
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">Security Settings</h3>

              <p className="text-slate-600 text-sm">
                You signed in using <span className="font-medium text-slate-900">Google</span>.
              </p>

              <p className="text-slate-500 text-sm">
                Password changes are not available for social login providers.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 🔴 ACTIONS */}
      <div className="mt-6 bg-white border border-slate-200 shadow-md rounded-xl p-6 flex justify-between items-center">
        <div>
          <h3 className="text-slate-900 font-semibold">Account Actions</h3>
          <p className="text-slate-600 text-sm">
            Manage your account session
          </p>
        </div>

        <SignOut />
      </div>
    </div>
  );
}