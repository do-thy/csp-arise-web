"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/configs/firebase";
import { signOut } from "firebase/auth";

// Define a type for our field-specific errors
interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // 📂 Track separate errors for each field
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  // 🔍 Client-side validation logic
  const validateForm = (): boolean => {
    const tempErrors: FormErrors = {};
    
    // 🏷️ Full Name validation (Checks for empty, length, and numbers)
    const nameRegex = /^[a-zA-Z\s]*$/; // Regex that allows ONLY letters and spaces

    if (!name.trim()) {
      tempErrors.name = "Full name is required.";
    } else if (name.trim().length < 2) {
      tempErrors.name = "Name must be at least 2 characters long.";
    } else if (!nameRegex.test(name)) {
      tempErrors.name = "Full name can only contain letters and spaces.";
    }

    // Username validation
    if (!username.trim()) {
      tempErrors.username = "Username is required.";
    } else if (username.includes(" ")) {
      tempErrors.username = "Username cannot contain spaces.";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      tempErrors.email = "Email address is required.";
    } else if (!emailRegex.test(email)) {
      tempErrors.email = "Please enter a valid email address (e.g., name@example.com).";
    }

    // Password validation
    if (!password) {
      tempErrors.password = "Password is required.";
    } else if (password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters long.";
    }

    setErrors(tempErrors);
    // Returns true if the errors object has no keys (meaning no errors found)
    return Object.keys(tempErrors).length === 0;
  };

  const handleRegister = async () => {
    // Clear previous errors
    setErrors({});

    // 1️⃣ Run front-end checks first
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 🔐 Create user in Firebase Auth
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
      router.push("/login");

    } catch (err) {
      const error = err as { code?: string };
      console.error(error);
      
      // 2️⃣ Handle Firebase server-side errors and assign them to specific fields
      const serverErrors: FormErrors = {};
      
      switch (error.code) {
        case "auth/email-already-in-use":
          serverErrors.email = "This email is already registered. Try logging in.";
          break;
        case "auth/invalid-email":
          serverErrors.email = "The email address format is invalid.";
          break;
        case "auth/weak-password":
          serverErrors.password = "The password is too weak. Use a stronger password.";
          break;
        default:
          serverErrors.password = "Registration failed. Please try again.";
          break;
      }
      
      setErrors(serverErrors);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* 🌫️ Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40 z-10" />

      {/* 🧩 Container */}
      <div className="relative z-20 flex items-center justify-center h-full">
        
        <div className="w-[90%] max-w-[750px] min-h-[580px] py-6 flex rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-white/20 bg-black/30 backdrop-blur-xl transition-all duration-300">
          
          <div className="flex-1 flex items-center justify-center px-10">
            <div className="w-full max-w-[360px] text-white">

              <h2 className="text-2xl font-semibold text-center mb-1">
                Create Account
              </h2>
              <p className="text-sm text-white/60 text-center mb-6">
                Register to continue
              </p>

              {/* Full Name Input */}
              <div className="mb-3">
                <label className="text-sm text-white/70">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border text-white focus:ring-2 focus:ring-[#A12124] outline-none transition-colors ${
                    errors.name ? "border-red-500 bg-red-500/10" : "border-white/40"
                  }`}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Username Input */}
              <div className="mb-3">
                <label className="text-sm text-white/70">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border text-white focus:ring-2 focus:ring-[#A12124] outline-none transition-colors ${
                    errors.username ? "border-red-500 bg-red-500/10" : "border-white/40"
                  }`}
                />
                {errors.username && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{errors.username}</p>
                )}
              </div>

              {/* Email Input */}
              <div className="mb-3">
                <label className="text-sm text-white/70">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border text-white focus:ring-2 focus:ring-[#A12124] outline-none transition-colors ${
                    errors.email ? "border-red-500 bg-red-500/10" : "border-white/40"
                  }`}
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="mb-4">
                <label className="text-sm text-white/70">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full mt-1 px-4 py-2 rounded-lg bg-white/30 border text-white focus:ring-2 focus:ring-[#A12124] outline-none transition-colors ${
                    errors.password ? "border-red-500 bg-red-500/10" : "border-white/40"
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-400 mt-1 font-medium">{errors.password}</p>
                )}
              </div>

              {/* Register Button */}
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#A12124] hover:bg-[#811a1d] disabled:bg-gray-600 disabled:cursor-not-allowed transition rounded-lg py-2 font-semibold mb-4"
              >
                {loading ? "Creating Account..." : "Register"}
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

    </div>
  );
}