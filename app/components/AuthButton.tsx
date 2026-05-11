"use client";

import Image from "next/image";
import google from "@/public/google.png";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export function SignIn() {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const user = result.user;

      // 🔥 Check if user exists in Firestore
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      // If new user → create full profile
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

      const role = docSnap.exists()
        ? docSnap.data().role
        : "user";

      // ✅ Redirect
      if (role === "admin") {
        router.push("/admin");
      } else {
        router.push("/map3d/maincampus");
      }

    } catch (error) {
      console.log(error);
      alert("Google login failed");
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
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-auto px-4 py-2 rounded-lg bg-[#A12124] hover:bg-[#811a1d] text-white text-sm transition"
    >
      Sign Out
    </button>
  )
;}

interface LoginButtonProps {
  role: string;
  email: string;
  password: string;
}

export function LoginButton({ role, email, password }: LoginButtonProps) {
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
        alert("No user data found");
        return;
      }

      const dbRole = docSnap.data().role;

      if (role.toLowerCase() !== dbRole.toLowerCase()) {
        alert("Invalid role selected");
        return;
}

      // ✅ Redirect based on role
      if (dbRole === "admin") {
        router.push("/admin");
      } else {
        router.push("/map3d/maincampus");
        return;
      }

    } catch (error) {
      alert("Invalid email or password");
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