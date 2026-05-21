"use client";

import Image from "next/image";
import google from "@/public/google.png";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/configs/firebase";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SignInProps {
  role: string;
}

export function SignIn({ role }: SignInProps) {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();

      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      // Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      // If new user → create profile
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName || "",
          username: user.displayName || "user",
          email: user.email,
          role: "user",
          provider: "google",
          photoURL: user.photoURL || "",
        });
      }

      const dbRole = docSnap.exists()
        ? docSnap.data().role
        : "user";

      // ✅ Redirect
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/map3d");
      }

      // Success
      toast.success("Google sign in successful", {
        position: "top-center",
      });

      setTimeout(() => {
        if (dbRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/map3d/digicampus");
        }
      }, 1000);

    } catch (error) {
      console.log(error);

      toast.error("Google login failed", {
        position: "top-center",
      });
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="w-full bg-white text-black font-semibold hover:bg-[#811a1d] py-2 rounded-lg flex items-center justify-center gap-2 hover:scale-98 hover:text-white transition"
    >
      <Image src={google} alt="Google" width={18} height={18} />
      Continue with Google
    </button>
  );
}

export function SignOut() {
  const router = useRouter();

  const handleLogout = async () => {

    await firebaseSignOut(auth);

    toast.success("Signed out successfully", {
      position: "top-center",
    });

    setTimeout(() => {
      router.push("/login");
    }, 1000);
  };

  return (
    <button
      onClick={handleLogout}
      className="w-auto px-4 py-2 rounded-lg bg-[#A12124] hover:bg-[#811a1d] text-white text-sm transition"
    >
      Sign Out
    </button>
  );
}

interface LoginButtonProps {
  role: string;
  email: string;
  password: string;
}

export function LoginButton({
  role,
  email,
  password,
}: LoginButtonProps) {

  const router = useRouter();

  const handleLogin = async () => {

    try {

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {

        toast.error("No user data found", {
          position: "top-center",
        });

        return;
      }

      const dbRole = docSnap.data().role;

      // Validate selected role
      if (role.toLowerCase() !== dbRole.toLowerCase()) {

      // ✅ Redirect based on role
      if (dbRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/map3d");
        return;
      }

      // Success
      toast.success("Login successful", {
        position: "top-center",
      });

      setTimeout(() => {

        if (dbRole === "admin") {
          router.push("/admin");
        } else {
          router.push("/map3d/digicampus");
        }

      }, 1000);

    } catch {

      toast.error("Invalid email or password", {
        position: "top-center",
      });
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="w-full bg-[#A12124] hover:bg-[#811a1d] transition rounded-lg py-2 font-semibold"
    >
      Log In
    </button>
  );
}