"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  X, 
  Share, 
  PlusSquare, 
  ExternalLink,
  Smartphone,
  Plus
} from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
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
      // Auto open prompt instantly when the browser signals PWA installability
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 6. IMMEDIATE INSTANT LOAD POPUP LOGIC:
    // Display the prompt immediately on startup if they are not in standalone mode and did not dismiss recently
    const dismissedToday = localStorage.getItem("pwa_dismissed_today");
    // Only check dismissal delay of 1 hour to respect user choices cleanly
    const recentlyDismissed = dismissedToday && (Date.now() - parseInt(dismissedToday)) < 1 * 60 * 60 * 1000;
    
    if (!recentlyDismissed && !isStandalone) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  // Handle banner dismissal
  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowPrompt(false);
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
          setShowPrompt(false);
        }
      } catch (err) {
        console.error("Installation prompt execution error:", err);
      }
    } else {
      if (isInIframe) {
        // PWA installer trigger is blocked inside iframes by browsers.
        // We open the app cleanly in a new window/tab so Chrome natively prompts immediately
        window.open(window.location.href, "_blank");
      } else if (isIOS) {
        // Guided iOS message
      } else {
        // Fallback for standalone outside of iframe (Chrome mobile menu instructions for older devices)
        alert("App installation requested. Please open your Chrome menu (⋮) and tap 'Install app' or 'Add to Home screen' to save Cash Earn directly.");
      }
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <div className="fixed inset-x-0 bottom-0 z-[999999] p-4 flex justify-center pointer-events-none select-none">
          
          {/* Classic Browser Bottom Sheet / Bar layout */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="w-full max-w-lg bg-[#0e172a] border border-slate-800 rounded-3xl p-5 shadow-[0_-8px_40px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col gap-4"
            id="pwa-normal-prompt"
          >
            {/* Top row: Icon, App Name & Simple details */}
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center p-0.5 border border-slate-800 shadow-md">
                <img src="/icon.svg" alt="Cash Earn" className="w-full h-full rounded-2xl object-cover" />
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-white font-sans">
                  Add Cash Earn to Home Screen
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Play tasks & withdraw easily from your phone desk
                </p>
              </div>
              <button 
                onClick={() => handleDismiss()}
                className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Special Instructions for iPhone/Safari */}
            {isIOS && (
              <div className="text-left bg-slate-900/50 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                <p className="font-bold text-amber-500 mb-1 flex items-center gap-1">
                  <Share className="w-3.5 h-3.5 inline" /> Safari iOS Setup:
                </p>
                Tap on share 📤 at the bottom header layout, then scroll down and click <span className="text-white font-bold inline-flex items-center gap-0.5">Add to Home Screen <Plus className="w-3 h-3 text-amber-500 animate-pulse" /></span>.
              </div>
            )}

            {/* IFrame helper for the developer preview tool standalone option */}
            {isInIframe && (
              <div className="text-left bg-slate-950/80 p-3 rounded-xl border border-slate-900 text-xs text-[#94a3b8]">
                <p className="font-bold text-blue-400 mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3.5 h-3.5" /> Developer Preview Standalone Mode:
                </p>
                Click "Add App" to open the sandbox cleanly in a new tab where Chrome natively launches the official home installation prompt.
              </div>
            )}

            {/* Simple classic buttons row */}
            <div className="flex gap-2.5">
              <button
                onClick={() => handleDismiss()}
                className="w-1/2 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                id="btn-dismiss-pwa"
              >
                Cancel
              </button>

              <button
                onClick={handleInstallClick}
                className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                id="btn-install-pwa"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5]" strokeWidth={2.5} />
                {isInIframe ? "Add App" : "Install Now"}
              </button>
            </div>
          </motion.div>
          
        </div>
      )}
    </AnimatePresence>
  );
}
