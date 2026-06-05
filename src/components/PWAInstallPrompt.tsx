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
  ShieldCheck,
  Chrome,
  Laptop,
  Check,
  ChevronRight,
  ArrowRight,
  HelpCircle
} from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  
  // Custom navigation state inside the installer modal:
  // "welcome" -> main product perks view
  // "instructions" -> step-by-step browser PWA guide
  const [modalView, setModalView] = useState<"welcome" | "instructions">("welcome");
  const [deviceType, setDeviceType] = useState<"android" | "ios" | "desktop">("android");

  useEffect(() => {
    // 1. Detect standalone (PWA) display mode to prevent double popping if already installed
    const checkPWA = () => {
      const isStandaloneMode = 
        window.matchMedia("(display-mode: standalone)").matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };

    checkPWA();

    // 2. Identify the active client environment for premium targeted guides
    const identifyDevice = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isAndroid = /android/.test(userAgent);
      const isSafari = !/crios|fxios|opera|twitter|fb_iab|instagram/i.test(userAgent) && /safari/.test(userAgent);
      
      setIsIOS(isApple && isSafari);

      if (isApple) {
        setDeviceType("ios");
      } else if (isAndroid) {
        setDeviceType("android");
      } else {
        setDeviceType("desktop");
      }
    };

    identifyDevice();

    // 3. Register standard Service Worker to qualify the domain for official PWA activation
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js")
          .then((reg) => console.log("PWA Service Worker online:", reg.scope))
          .catch((err) => console.log("PWA Service Worker failed to start:", err));
      });
    }

    // 4. Register the standard browser PWA interceptor
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Ensure we immediately mount the trigger
      setShowCenterModal(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 5. IMMEDIATE ACCESS ACTION (As soon as they load the browser, popup instantly!)
    const triggerTimer = setTimeout(() => {
      // Force pop the installation modal instantly on load
      const isDismissed = localStorage.getItem("pwa_force_dismissed_today");
      const recentDismiss = isDismissed && (Date.now() - parseInt(isDismissed)) < 1 * 60 * 60 * 1000; // 1-hour delay bypass only

      if (!recentDismiss) {
        setShowCenterModal(true);
      }
    }, 100);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(triggerTimer);
    };
  }, []);

  // Gracefully clear/dismiss the installation modal
  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowCenterModal(false);
    setModalView("welcome");
    localStorage.setItem("pwa_force_dismissed_today", Date.now().toString());
  };

  // Perform genuine browser setup prompt
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        // Trigger browser's standard prompt UI natively
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`Native installation prompt result: ${outcome}`);
        
        if (outcome === "accepted") {
          setDeferredPrompt(null);
          setShowCenterModal(false);
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 5000);
        } else {
          // If they denied the native popup, transition to secondary instruction screen so they can still install manual
          setModalView("instructions");
        }
      } catch (err) {
        console.error("Installation prompt execution exception:", err);
        setModalView("instructions");
      }
    } else {
      // If native fast-trigger not verified yet, switch to the creative step-by-step assistant guide!
      setModalView("instructions");
    }
  };

  if (isStandalone) {
    return null; // Skip rendering if we are inside installed standalone PWA app
  }

  return (
    <>
      {/* MAJESTIC GLOWING CENTER PWA POPUP */}
      <AnimatePresence>
        {showCenterModal && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 select-none">
            {/* Interactive Backdrop container with fine cinematic blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => handleDismiss()}
              className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
              id="pwa-backdrop"
            />

            {/* Main Modal Card */}
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 22 }}
              className="relative w-full max-w-md bg-[#0a0f1d] border-2 border-amber-500/50 rounded-[32px] p-6 md:p-8 shadow-[0_0_60px_rgba(245,158,11,0.3)] overflow-hidden text-center"
              id="pwa-modal-body"
            >
              {/* Dynamic Golden Visual Accents */}
              <div className="absolute left-1/2 -top-24 -translate-x-1/2 w-64 h-32 bg-amber-500/10 rounded-full blur-[60px]" />
              <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-yellow-500/5 rounded-full blur-[50px]" />

              {/* Top dismissal X button */}
              <button
                onClick={() => handleDismiss()}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-2 hover:bg-white/5 rounded-full transition-colors z-20"
                id="pwa-close-btn"
              >
                <X className="w-5 h-5" />
              </button>

              {modalView === "welcome" ? (
                /* VIEW 1: WELCOME & BENEFITS INTERFACE */
                <div className="relative z-10" id="pwa-welcome-view">
                  {/* Floating installation system design */}
                  <div className="relative mx-auto mt-2 mb-5 w-24 h-24 bg-gradient-to-b from-[#1b253b] to-[#0f172a] rounded-3xl flex items-center justify-center border-2 border-amber-500/40 shadow-inner group">
                    <Smartphone className="w-12 h-12 text-amber-500 relative z-10 animate-pulse" />
                    <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce flex-shrink-0" />
                    <div className="absolute inset-0 rounded-3xl bg-amber-500/5 group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  {/* Title & Badge */}
                  <h3 className="text-2xl font-black font-sans text-white tracking-tight leading-tight flex items-center justify-center gap-2">
                    Install Cash Earn App <Sparkles className="w-5.5 h-5.5 text-amber-400 fill-amber-400" />
                  </h3>

                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-amber-400 font-extrabold bg-amber-500/15 w-fit mx-auto px-3.5 py-1.5 rounded-full border border-amber-500/35">
                    <ShieldCheck className="w-4 h-4 text-amber-400" /> Official Safe Web App (No Warning)
                  </div>

                  <p className="text-sm text-slate-300 mt-4 max-w-xs mx-auto leading-relaxed font-medium">
                    Chrome ya default browser se install karein. Screen short-link setup hone se premium task performance milti hai!
                  </p>

                  {/* High visual interest lists */}
                  <div className="my-6 bg-[#0e1629] border border-slate-800/80 rounded-2xl p-4 text-left space-y-4">
                    <div className="flex items-start gap-3.5">
                      <div className="bg-emerald-500/10 p-2.5 rounded-xl mt-0.5 border border-emerald-500/20">
                        <Coins className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-100">✨ Fast 1-Click Launching</h5>
                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Browser address search karne ki jaroorat nahi hai.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3.5">
                      <div className="bg-amber-500/10 p-2.5 rounded-xl mt-0.5 border border-amber-500/20">
                        <Zap className="w-5 h-5 text-amber-400" />
                      </div>
                      <div>
                        <h5 className="text-sm font-bold text-slate-100">🚀 10x Fast Daily Rewards</h5>
                        <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">Instant daily reward scratch & spin loads with no delay!</p>
                      </div>
                    </div>
                  </div>

                  {/* Double Actions with Enlarged primary Download Button */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleDismiss()}
                      className="w-full sm:order-1 py-3.5 px-6 rounded-2xl border-2 border-slate-800 text-slate-400 hover:bg-slate-900 hover:text-white font-sans text-sm font-extrabold transition-all duration-200 cursor-pointer"
                      id="pwa-welcome-cancel"
                    >
                      Not Now
                    </button>

                    <button
                      onClick={handleInstallClick}
                      className="w-full sm:order-2 py-4 px-8 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-sans text-base font-black flex items-center justify-center gap-2.5 shadow-[0_6px_22px_rgba(245,158,11,0.4)] hover:shadow-[0_8px_30px_rgba(245,158,11,0.6)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
                      id="pwa-welcome-download"
                    >
                      <Download className="w-5 h-5 stroke-[2.5]" /> Download App
                    </button>
                  </div>
                </div>
              ) : (
                /* VIEW 2: DETAILED INTERACTIVE INSTRUCTIONS IF NOT INSTANTLY READY */
                <div className="relative z-10" id="pwa-instructions-view">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <HelpCircle className="w-6 h-6 text-amber-400" />
                    <span className="text-xs font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      Easy Installation Guide
                    </span>
                  </div>

                  <h3 className="text-xl font-extrabold text-white leading-tight font-sans">
                    Apne Phone Me Kaise Install Karein?
                  </h3>
                  
                  <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto">
                    Keval 1-click feature se direct screen link add karein:
                  </p>

                  {/* TARGETED STEPS BASED ON DETECTED ENV */}
                  <div className="my-5 text-left bg-[#0e1629] p-5 rounded-2xl border border-slate-800 space-y-4">
                    
                    {deviceType === "ios" ? (
                      /* iOS Step Guidance */
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Browser ke bottom navigation me share button (<span className="text-white bg-slate-800 px-1.5 py-0.5 rounded">Share Button 📤</span>) tab karein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Scroll down karke <span className="text-amber-400 font-extrabold">Add to Home Screen</span> par select karein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Upar right corner par <span className="text-white font-extrabold">Add</span> click karein. Aapka application install ho jaega!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : deviceType === "android" ? (
                      /* Android Chrome Custom Step Guidance */
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200 flex items-center gap-1 flex-wrap">
                              Apne top-right column me three dots (<span className="text-white bg-slate-800 px-1 py-0.5 rounded font-mono">⋮</span>) icon select karein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Niche scroll karke <span className="text-amber-400 font-extrabold">"Install App"</span> ya <span className="text-amber-400 font-extrabold">"Add to Home Screen"</span> chunein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Confirm tap karte hi shortcut launch icon aapke home screen par download complete kar dega!
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* DESKTOP GUIDANCE */
                      <div className="space-y-3.5">
                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            1
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Browser top address bar ke right side check karein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            2
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              Wahan par mini monitor arrow icon (<Download className="w-3.5 h-3.5 inline text-amber-400" />) ya custom address settings check karein.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="bg-amber-500/10 text-amber-400 text-xs font-black h-6 w-6 rounded-full flex items-center justify-center border border-amber-500/20 mt-0.5 flex-shrink-0">
                            3
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-200">
                              <span className="text-amber-400 font-extrabold">"Install"</span> button dabate hi full screen offline launcher ready!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Manual trigger help action */}
                  <div className="flex items-center justify-center gap-4 pt-3">
                    <button
                      onClick={() => setModalView("welcome")}
                      className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      id="pwa-back-btn"
                    >
                      ← Back to Benefits
                    </button>
                    
                    <button
                      onClick={() => handleDismiss()}
                      className="text-xs font-bold text-slate-400 hover:text-slate-300 cursor-pointer transition-colors"
                      id="pwa-not-now-btn"
                    >
                      Bypass list
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST WITH ACCENTS */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999999] bg-emerald-600 text-white shadow-[0_8px_30px_rgba(16,185,129,0.3)] p-4.5 rounded-2xl flex items-center gap-3 border border-emerald-400/40 max-w-sm"
            id="pwa-success-toast"
          >
            <Check className="w-6 h-6 text-emerald-100 bg-white/20 p-1 rounded-full flex-shrink-0" />
            <div className="text-left">
              <p className="font-extrabold text-sm leading-tight text-white">App Configured Successfully!</p>
              <p className="text-[11px] text-emerald-100 mt-1">Short-link setup triggered! Launch from your device anytime.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
