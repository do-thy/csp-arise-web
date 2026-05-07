"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { toast } from "sonner";

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    try {
      if (!auth.currentUser || !auth.currentUser.email) return;

      if (newPassword !== confirmPassword) {
        toast.error("New passwords do not match", {
        position: "top-center",
        });
        return;
      }

      //Re-authenticate user
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);

      //Update password
      await updatePassword(auth.currentUser, newPassword);

      toast.success("Password updated successfully", {
        position: "top-center",
      });

      //reset fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      toast.error(errorMessage, {
        position: "top-center",
      });
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-white font-semibold">Change Password</h4>

      {/* Current Password */}
      <input
        type="password"
        placeholder="Current password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white outline-none"
      />

      {/* New Password */}
      <input
        type="password"
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white outline-none"
      />

      {/* Confirm Password */}
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-slate-700 text-white outline-none"
      />

      <button
        onClick={handleChangePassword}
        className="bg-[#A12124] hover:bg-[#811a1d] px-4 py-2 rounded-lg text-white text-sm"
      >
        Update Password
      </button>
    </div>
  );
}