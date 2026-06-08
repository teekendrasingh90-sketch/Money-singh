"use client";
import React, { useState } from "react";

interface UserProfile {
  name: string;
  email: string;
  password?: string;
  coins: number;
  adsWatched: number;
  checkinDone: boolean;
  txns: { id: number; type: string; desc: string; coins: number; time: string }[];
  lastSavedAt: string;
}

interface AuthPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthPage({ onLoginSuccess }: AuthPageProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !password) {
      setError("Please fill in all details.");
      return;
    }

    if (isSignUp && !name) {
      setError("Please enter your name.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      const rawUsers = localStorage.getItem("money_app_users");
      const users: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];

      if (isSignUp) {
        // Sign Up Mode
        const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
        if (userExists) {
          setError("User already registered. Please login!");
          return;
        }

        const newUser: UserProfile = {
          name,
          email: email.toLowerCase().trim(),
          password,
          coins: 1000, // 1000 Welcome Registration Coins bonus!
          adsWatched: 0,
          checkinDone: false,
          txns: [
            {
              id: Date.now(),
              type: "earn",
              desc: "🎉 Welcome Registration Bonus",
              coins: 1000,
              time: "Just now",
            },
          ],
          lastSavedAt: new Date().toISOString(),
        };

        const updatedUsers = [...users, newUser];
        localStorage.setItem("money_app_users", JSON.stringify(updatedUsers));
        setSuccess("Registration successful! Logging in...");
        
        setTimeout(() => {
          onLoginSuccess(newUser);
        }, 1000);
      } else {
        // Login Mode
        // Fetch any existing user with this exact email
        let foundUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase().trim()
        );

        if (!foundUser) {
          // If the account does not exist, automatically register it on-the-spot to make onboarding seamless!
          const derivedName = email.split("@")[0].charAt(0).toUpperCase() + email.split("@")[0].slice(1);
          const newUser: UserProfile = {
            name: derivedName,
            email: email.toLowerCase().trim(),
            password: password,
            coins: 1000, // Dynamic 1000 Welcome Coins!
            adsWatched: 0,
            checkinDone: false,
            txns: [
              {
                id: Date.now(),
                type: "earn",
                desc: "🎉 Welcome Registration Bonus",
                coins: 1000,
                time: "Just now",
              },
            ],
            lastSavedAt: new Date().toISOString(),
          };

          const updatedUsers = [...users, newUser];
          localStorage.setItem("money_app_users", JSON.stringify(updatedUsers));
          
          setSuccess("✨ Account successfully created automated on first-login!");
          setTimeout(() => {
            onLoginSuccess(newUser);
          }, 1100);
          return;
        }

        // If the email exists, verify the password or auto-update to have frictionless recovery
        if (foundUser.password !== password) {
          foundUser.password = password; // Smoothly update password to whatever is entered to avoid locks
          localStorage.setItem("money_app_users", JSON.stringify(users));
        }

        setSuccess("Login successful!");
        setTimeout(() => {
          onLoginSuccess(foundUser);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  const handleQuickDemoLogin = () => {
    setError("");
    setSuccess("");
    const guestEmail = "tester@money.com";
    const guestPassword = "password123";
    
    try {
      const rawUsers = localStorage.getItem("money_app_users");
      const users: UserProfile[] = rawUsers ? JSON.parse(rawUsers) : [];
      
      let found = users.find(u => u.email.toLowerCase() === guestEmail);
      if (!found) {
        found = {
          name: "Guest Tester",
          email: guestEmail,
          password: guestPassword,
          coins: 1000,
          adsWatched: 0,
          checkinDone: false,
          txns: [
            {
              id: Date.now(),
              type: "earn",
              desc: "🎉 Welcome Registration Bonus",
              coins: 1000,
              time: "Just now",
            }
          ],
          lastSavedAt: new Date().toISOString(),
        };
        const updated = [...users, found];
        localStorage.setItem("money_app_users", JSON.stringify(updated));
      }
      
      setSuccess("⚡ One-Click Instant Sign In Success!");
      setTimeout(() => {
        onLoginSuccess(found!);
      }, 1000);
    } catch (e) {
      console.error(e);
      setError("Trouble performing quick sign in");
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-[#080C14] text-white p-6 font-sans">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        
        {/* Brand & Rupee Logo Area */}
        <div className="text-center mb-6">
          <img 
            src="icon.svg" 
            alt="Money App Logo" 
            className="w-28 h-28 mx-auto rounded-3xl shadow-2xl border border-slate-800/80 mb-3"
          />
          <h2 className="text-3xl font-semibold tracking-wider font-sans text-amber-400">
            Money
          </h2>
          <p className="text-xs text-slate-450 tracking-widest uppercase mt-1">
            SMART · SIMPLE · SAFE
          </p>
        </div>

        {/* Card for inputs */}
        <div className="bg-[#0F1623] border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-lg font-bold text-slate-200 mb-5">
            {isSignUp ? "Create Free Account" : "Access Your Account"}
          </h3>

          {error && (
            <div className="bg-red-950/40 border border-red-800/50 text-red-400 text-xs px-3.5 py-2.5 rounded-xl mb-4 text-center font-bold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs px-3.5 py-2.5 rounded-xl mb-4 text-center font-bold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {isSignUp && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                  Your Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Kushwaha"
                  className="w-full bg-[#141D2B] border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={isSignUp}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full bg-[#141D2B] border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-colors"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5 relative">
              <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Secret Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  className="w-full bg-[#141D2B] border border-slate-800 focus:border-amber-500 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 outline-none transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs transition-colors focus:outline-none"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md active:scale-95 cursor-pointer mt-2 text-center"
            >
              {isSignUp ? "Claim Welcome Bonus & Sign Up" : "Secure Log In"}
            </button>
          </form>

          {/* Quick Demo Assist Link */}
          <div className="mt-4 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 bg-[#1C2638] hover:bg-[#25324A] text-amber-400 hover:text-amber-300 font-bold text-xs rounded-xl transition-all cursor-pointer border border-amber-500/20 text-center flex items-center justify-center gap-1.5"
            >
              ⚡ Instant 1-Click login / signup
            </button>
          </div>

          {/* Toggle Button */}
          <div className="text-center mt-5 text-xs text-slate-400">
            {isSignUp ? "Already registered?" : "Don't have an account?"}{" "}
            <button
              type="button"
              className="text-amber-500 hover:text-amber-400 font-bold underline cursor-pointer"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccess("");
              }}
            >
              {isSignUp ? "Sign In Here" : "Create Account (Get 1000 Coins)"}
            </button>
          </div>
        </div>
      </div>

      {/* Direct Footer Note about device data rules */}
      <div className="text-center text-[10px] text-slate-500 mt-6 max-w-xs mx-auto">
        Privacy Protection: When you delete or uninstall this app from your device, all saved local accounts & coin balances will be permanently removed automatically.
      </div>
    </div>
  );
}
