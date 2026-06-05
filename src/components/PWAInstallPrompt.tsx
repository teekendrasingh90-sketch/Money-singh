"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  X, 
  Sparkles, 
  Smartphone, 
  CheckCircle, 
  Share, 
  PlusSquare, 
  ExternalLink,
  Laptop
} from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // 1. Detect if the website is running inside an iframe (like the AI Studio Preview panel)
    const checkIframe = () => {
      try {
        setIsInIframe(window.self !== window.top);
      } catch (e) {
        setIsInIframe(true);
      }
    };
    checkIframe();

    // 2. Detect if already in standalone (PWA) mode to prevent double prompts
    const checkPWA = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkPWA();

    // 3. Detect iOS Safari
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = !/crios|fxios|opera|twitter|fb_iab|instagram/i.test(userAgent) && /safari/.test(userAgent);
      setIsIOS(isApple && isSafari);
    };
    checkIOS();

    // 4. Register official standard Service Worker (Required for Chrome's native installability criteria)
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("PWA Service Worker registered:", reg.scope))
          .catch((err) => console.error("PWA Service Worker registration error:", err));
      });
    }

    // 5. Intercept the standard beforeinstallprompt event fired natively by Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Auto open center prompt instantly when the browser signals PWA installability
      setShowCenterModal(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. IMMEDIATE POPUP LOGIC:
    // When the user opens the page, immediately show the install popup without any long delays
    const popupTimer = setTimeout(() => {
      const dismissedToday = localStorage.getItem("pwa_dismissed_today");
      // Show immediately if they haven't dismissed it in the last hour
      const recentlyDismissed = dismissedToday && (Date.now() - parseInt(dismissedToday)) < 1 * 60 * 60 * 1000;
      
      if (!recentlyDismissed && !isStandalone) {
        setShowCenterModal(true);
      }
    }, 150); // Instant 150ms mount delay for a clean smooth animation transition

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(popupTimer);
    };
  }, [isStandalone]);

  // Close PWA banner and save cancellation time
  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowCenterModal(false);
    localStorage.setItem("pwa_dismissed_today", Date.now().toString());
  };

  // Perform native browser installation prompt trigger
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Trigger Chrome's actual native prompt automatically
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Native installation prompt option chosen: ${outcome}`);
        
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowCenterModal(false);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
        }
      } catch (err) {
        console.error("Installation prompt execution error:", err);
      }
    } else {
      // If we don't have the deferred prompt yet:
      if (isInIframe) {
        // Since browsers block raw native install triggers inside IFrames (AI Studio preview iframe)
        // we offer to open the sandbox cleanly in a new tab so Chrome can natively mount it!
        window.open(window.location.href, "_blank");
      } else {
        // Fallback for standalone outside of iframe (Chrome mobile menu instructions)
        alert("PWA installation trigger init. Agar auto-install prompt nahi aaya, toh chrome menu (⋮) me jaakar 'Install app' ya 'Add to Home screen' par click karein.");
      }
    }
  };

  // If already running inside active installed PWA, do not render a thing
  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* 1. NATIVE-LOOKING LIGHT CENTER POPUP */}
      <AnimatePresence>
        {showCenterModal && (
          <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
            {/* Soft dark background cover */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleDismiss()}
              className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
              id="pwa-backdrop"
            />

            {/* Standard Official Look Card */}
            <motion.div
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 20, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl text-center overflow-hidden"
              id="pwa-dialog-card"
            >
              {/* Glow background accent */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-10 bg-amber-500/10 rounded-full blur-xl"></div>

              {/* Top Row: App Header Logo */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 p-0.5 shadow-md">
                  {/* Real beautiful SVG icon loading in PWA prompt */}
                  <img src="/icon.svg" alt="App Logo" className="w-full h-full rounded-2xl object-contain" />
                </div>
                
                <h3 className="text-xl font-bold text-white mt-3 font-sans">
                  Install Cash Earn
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  cashearn.app • Verified PWA Web App
                </p>
              </div>

              {/* Standard Simple Perks Description */}
              <div className="my-4 py-3 px-4 bg-slate-950/50 rounded-xl text-left border border-slate-800/80">
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  Instantly home screen par save karein. Background speed optimize hogi aur task automatic fast loading complete honge!
                </p>
              </div>

              {/* Specific instructions for Safari on iPhone if detected */}
              {isIOS && (
                <div className="mb-4 text-left p-3.5 bg-amber-500/10 rounded-xl border border-amber-500/20">
                  <p className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Share className="w-3.5 h-3.5" /> iOS Instructions:
                  </p>
                  <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                    Bottom toolbar par <span className="font-extrabold text-white">Share 📤</span> button click karke <span className="font-extrabold text-white">Add to Home Screen</span> select karein.
                  </p>
                </div>
              )}

              {/* Sandboxed iframe Warning helper */}
              {isInIframe && (
                <div className="mb-4 text-left p-3 bg-blue-500/10 rounded-xl border border-blue-500/25">
                  <p className="text-[11px] text-blue-300 font-semibold leading-relaxed flex items-center gap-1">
                    <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                    Preview IFrame bypass karne aur PWA prompt direct open karne ke liye download par click karein.
                  </p>
                </div>
              )}

              {/* Action Rows: Download or Cancel */}
              <div className="flex gap-2.5 mt-2">
                <button
                  onClick={() => handleDismiss()}
                  className="w-1/2 py-2.5 px-4 bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  id="btn-pwa-cancel"
                >
                  Cancel
                </button>

                <button
                  onClick={handleInstallClick}
                  className="w-1/2 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-750 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(245,158,11,0.2)] transition-all cursor-pointer"
                  id="btn-pwa-download"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                  {isInIframe ? "Launch & Download" : "Download App"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS POPUP TOAST */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] bg-emerald-600 text-white shadow-2xl p-4 rounded-xl flex items-center gap-3 border border-emerald-400/30 max-w-xs text-left"
            id="pwa-success-toast"
          >
            <CheckCircle className="w-6 h-6 text-emerald-100 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-xs leading-tight">Installation Started!</p>
              <p className="text-[10px] text-emerald-100 mt-1">Short-link icon setup completed on your device.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
