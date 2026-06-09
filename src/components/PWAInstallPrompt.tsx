"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Download, X } from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if already running in standalone PWA mode
    const checkPWA = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkPWA();

    // 2. Register Service Worker for PWA
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker.register("sw.js")
          .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
          .catch((err) => console.error("PWA Service Worker registration error:", err));
      };

      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
      }
    }

    // 3. Capturing early custom beforeinstallprompt event saved on window
    const savedEvent = (window as any).deferredPWAEvent;
    if (savedEvent) {
      setDeferredPrompt(savedEvent);
      setShowPrompt(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    (window as any).onPWAEventCaptured = (e: any) => {
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    // 4. Check dismissed status in localStorage (do not nag if dismissed within 24 hours)
    const dismissedTime = localStorage.getItem("pwa_dismissed_v1");
    const isRecentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 24 * 60 * 60 * 1000;

    if (!isRecentlyDismissed && !isStandalone) {
      // Small premium delay to let Page mount smoothly
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if ((window as any).onPWAEventCaptured) {
        delete (window as any).onPWAEventCaptured;
      }
    };
  }, [isStandalone]);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_dismissed_v1", Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA native install user choice: ${outcome}`);
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowPrompt(false);
        }
      } catch (err) {
        console.error("Installation prompt trigger error:", err);
      }
    } else {
      // FALLBACK: Immediately trigger direct download of the backup website zip package with NO DELAY!
      // This is exactly like standard Chrome file download (brings native Chrome downloader notification instantly).
      try {
        const link = document.createElement("a");
        link.href = "website.zip";
        link.download = "CashEarn-Applet-v1.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Hide the banner after trigger
        setShowPrompt(false);
      } catch (e) {
        console.error("Instant download execution error:", e);
      }
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-[99999] select-none pointer-events-auto"
        >
          {/* Unobtrusive, Floating Bottom Sheet Banner (Matches Money App Theme) */}
          <div className="bg-[#0E1524] border border-slate-800/80 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.65)] flex items-center justify-between gap-3 text-slate-100">
            {/* Left: App Icon & Name */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-emerald-950 rounded-xl flex items-center justify-center border border-emerald-500/15 shrink-0">
                <img src="icon.svg" alt="App Icon" className="w-full h-full rounded-xl object-cover" />
              </div>
              <div className="text-left">
                <div className="text-[14px] font-extrabold text-[#F59E0B] tracking-wide font-sans flex items-center gap-1.5">
                  Money App
                  <span className="bg-emerald-500/15 text-emerald-400 text-[9px] font-extrabold px-1.5 py-0.2 rounded-full border border-emerald-500/25">PWA</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  फ्री में इनस्टॉल करें और खेलना जारी रखें!
                </p>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstallClick}
                className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer border-none"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" strokeWidth={2.5} />
                Install
              </button>
              
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
