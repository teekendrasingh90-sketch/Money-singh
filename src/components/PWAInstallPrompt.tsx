"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Download, 
  X, 
  Sparkles, 
  Smartphone, 
  CheckCircle, 
  Coins, 
  Zap, 
  Share, 
  PlusSquare, 
  ArrowUp 
} from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTopBar, setShowTopBar] = useState(false);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  useEffect(() => {
    // 1. Detect if already in standalone (PWA) mode
    const checkPWA = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkPWA();

    // 2. Detect iOS Safari
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = !/crios|fxios|opera|twitter|fb_iab|instagram/i.test(userAgent) && /safari/.test(userAgent);
      setIsIOS(isApple && isSafari);
    };

    checkIOS();

    // 3. Register standard clean service worker to support PWA
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("PWA Service Worker registered successfully:", reg.scope))
          .catch((err) => console.log("PWA Service Worker registration failed:", err));
      });
    }

    // 4. Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Auto-trigger top bar with a 4 seconds delay for maximum conversion & experience
      const dismissedTime = localStorage.getItem("pwa_dismissed_time");
      const isRecentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 12 * 60 * 60 * 1000; // 12 hours check

      if (!isRecentlyDismissed) {
        setTimeout(() => {
          setShowTopBar(true);
        }, 4000);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Fallback trigger: if iOS or other devices that don't support beforeinstallprompt
    // allow showing the download banner after 8 seconds anyway
    const fallbackTimer = setTimeout(() => {
      const dismissedTime = localStorage.getItem("pwa_dismissed_time");
      const isRecentlyDismissed = dismissedTime && (Date.now() - parseInt(dismissedTime)) < 12 * 60 * 60 * 1000;
      
      if (!isRecentlyDismissed && !deferredPrompt && !isStandalone) {
        setShowTopBar(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt, isStandalone]);

  // Handle the top bar click
  const handleTopBarClick = () => {
    setShowTopBar(false);
    setShowCenterModal(true);
  };

  // Close PWA banners and cache dismissal
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTopBar(false);
    setShowCenterModal(false);
    localStorage.setItem("pwa_dismissed_time", Date.now().toString());
  };

  // Execute PWA custom installation
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA installation outcome: ${outcome}`);
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowCenterModal(false);
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      }
    } else if (isIOS) {
      // If iOS, they should see iOS manual instructions which we beautifully show inline inside the modal
    } else {
      // General fall-back guidance
      alert("App download is initiating. If it doesn't open support automatically, please click on your browser menu (⋮) and select 'Add to Home screen'.");
    }
  };

  if (isStandalone) {
    return null; // Don't show prompts if they are already in PWA standalone mode
  }

  return (
    <>
      {/* 1. TOP BAR DROPDOWN POPUP ("ek upar Se popup Aaye") */}
      <AnimatePresence>
        {showTopBar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            onClick={handleTopBarClick}
            className="fixed top-4 left-4 right-4 z-[9999] md:max-w-md md:left-auto md:right-4 cursor-pointer"
          >
            <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-4 relative group">
              {/* Decorative moving gold orb */}
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-yellow-400 rounded-full blur-2xl opacity-45 group-hover:scale-125 transition-transform duration-500"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/20 p-2.5 rounded-xl flex items-center justify-center animate-bounce">
                  <Smartphone className="w-5 h-5 text-yellow-100" />
                </div>
                
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-yellow-100 flex items-center gap-1.5 font-sans">
                    <Sparkles className="w-3.5 h-3.5" /> Bonus Offer
                  </p>
                  <h4 className="text-sm font-bold leading-tight font-sans text-white">
                    App Downloader Install Karein?
                  </h4>
                  <p className="text-[11px] text-white/90 font-medium">
                    Fast task speed aur fast withdrawal benefits paayein
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleDismiss}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. BIG CENTER MODAL POPUP ("bich mein ek bada Sa ek aur papa paye screen ke bich mein") */}
      <AnimatePresence>
        {showCenterModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop Blur overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleDismiss}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Modal Body Card */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}
              className="relative w-full max-w-md bg-[#0d1424] border border-amber-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(245,158,11,0.15)] overflow-hidden text-center"
            >
              {/* Shiny top light effect */}
              <div className="absolute left-1/2 -top-12 -translate-x-1/2 w-48 h-24 bg-amber-500 rounded-full blur-3xl opacity-20"></div>

              {/* Close Button on Top Right */}
              <button
                onClick={handleDismiss}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Glowing Phone Concept Illustration */}
              <div className="relative mx-auto mt-2 mb-6 w-20 h-20 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/30">
                <Smartphone className="w-10 h-10 text-amber-500 relative z-10 animate-pulse" />
                <div className="absolute inset-0 rounded-2xl bg-amber-500/5 animate-ping opacity-75"></div>
              </div>

              {/* Title and Descriptions */}
              <h3 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight flex items-center justify-center gap-2">
                Cash Earn Mobile App <Sparkles className="w-5 h-5 text-amber-400" />
              </h3>
              
              <p className="text-sm text-slate-400 mt-2 max-w-sm mx-auto">
                Official and completely free application. Browser loading bypass karein aur best experience payein!
              </p>

              {/* Features Perks Grid */}
              <div className="my-6 bg-[#16213a] border border-slate-800 rounded-2xl p-4 text-left space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500/10 p-1.5 rounded-lg mt-0.5">
                    <Coins className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold text-slate-200">₹50 Signup Bonus Coins</h5>
                    <p className="text-slate-400 text-xs mt-0.5">App install karne per direct credit</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-amber-500/10 p-1.5 rounded-lg mt-0.5">
                    <Zap className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold text-slate-200">10x Ads Loading Speed</h5>
                    <p className="text-slate-400 text-xs mt-0.5">Ads without buffering directly completed</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-indigo-500/10 p-1.5 rounded-lg mt-0.5">
                    <CheckCircle className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h5 className="text-[13px] font-bold text-slate-200">Secure Automated Cashouts</h5>
                    <p className="text-slate-400 text-xs mt-0.5">Instant secure UPI withdraw logs</p>
                  </div>
                </div>
              </div>

              {/* iOS Manual instructions if iOS Safari */}
              {isIOS && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-left mb-6 text-sm">
                  <p className="font-bold text-amber-400 flex items-center gap-1.5 mb-2">
                    <Share className="w-4 h-4" /> iOS Installation Instructions:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    <li>Safari browser ke <span className="font-bold text-white text-sm">Share Button</span> (Bottom toolbar) par click karein.</li>
                    <li>Slightly scroll down karke <span className="font-bold text-white text-sm flex-inline items-center gap-1">Add to Home Screen <PlusSquare className="inline w-3.5 h-3.5 text-amber-400" /></span> options ko select karein.</li>
                    <li>Upar <span className="font-bold text-white text-sm">Add</span> par click karein aur free fast access payein!</li>
                  </ol>
                </div>
              )}

              {/* Action Buttons ("download button aur ek cancel button do button") */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDismiss}
                  className="w-full sm:order-1 py-3 px-5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-sans text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>

                {(!isIOS || deferredPrompt) ? (
                  <button
                    onClick={handleInstallClick}
                    className="w-full sm:order-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.25)] hover:shadow-[0_6px_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download
                  </button>
                ) : (
                  isIOS ? null : (
                    <button
                      onClick={handleInstallClick}
                      className="w-full sm:order-2 py-3 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans text-sm font-bold flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. SUCCESS TOAST AFTER INSTALLATION */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] bg-emerald-600 text-white shadow-2xl p-4 rounded-2xl flex items-center gap-3 border border-emerald-400/30"
          >
            <CheckCircle className="w-6 h-6 text-emerald-100" />
            <div>
              <p className="font-bold text-sm leading-tight">Installation Started!</p>
              <p className="text-[11px] text-emerald-100">Enjoy the Cash Earn mobile app!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
