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
  Plus,
  CheckCircle2
} from "lucide-react";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  
  // Custom automated download visualizers (avoids standard browser alert popups)
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "completed">("idle");
  const [downloadProgress, setDownloadProgress] = useState(0);

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

    // 4. Register official standard Service Worker using relative path for sub-folder support
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

    // 5. Check if the beforeinstallprompt event was captured early by layout script
    const savedEvent = (window as any).deferredPWAEvent;
    if (savedEvent) {
      setDeferredPrompt(savedEvent);
      setShowPrompt(true);
    }

    // Intercept standard beforeinstallprompt event natively fired by modern browsers
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

    // 6. Automatically show bottom prompt if not recently dismissed
    const dismissedToday = localStorage.getItem("pwa_dismissed_today");
    const recentlyDismissed = dismissedToday && (Date.now() - parseInt(dismissedToday)) < 2 * 60 * 60 * 1000;
    
    if (!recentlyDismissed && !isStandalone) {
      // Slight delay for premium feel
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      if ((window as any).onPWAEventCaptured) {
        delete (window as any).onPWAEventCaptured;
      }
    };
  }, [isStandalone]);

  // Handle banner dismissal
  const handleDismiss = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setShowPrompt(false);
    localStorage.setItem("pwa_dismissed_today", Date.now().toString());
  };

  // Perform native browser installation script OR trigger automated file downloader fallback
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
      } else {
        // Start automatic direct loader sequence!
        // No alerts at all. Instant background download with custom visual progression bar
        setDownloadState("downloading");
        setDownloadProgress(0);
        
        const interval = setInterval(() => {
          setDownloadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setDownloadState("completed");
              
              // Programmatically trigger download of the app package zip (website.zip is relative)
              try {
                const link = document.createElement("a");
                link.href = "website.zip";
                link.download = "CashEarn-App.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (e) {
                console.error("Direct download execution error:", e);
              }

              // Automatically dismiss the prompt smoothly after 1.8s
              setTimeout(() => {
                setShowPrompt(false);
              }, 1800);

              return 100;
            }
            return prev + 10;
          });
        }, 120);
      }
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <div 
            className="fixed inset-0 z-[999999] p-4 flex items-center justify-center bg-black/60 backdrop-blur-[2px] select-none"
            onClick={() => handleDismiss()}
          >
            {/* Centered Modal card layout */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col gap-6 text-left"
              id="pwa-normal-prompt"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top row: Icon, App Name & Simple details */}
              <div className="flex items-start gap-5 text-left text-white">
                <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center p-0.5 border border-slate-800 shadow-md shrink-0">
                  <img src="icon.svg" alt="Cash Earn" className="w-full h-full rounded-2xl object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-extrabold text-white font-sans tracking-wide pt-0.5">
                    MONEY
                  </h4>
                  <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
                    Play tasks, claim daily bonus and withdraw your rewards securely directly from your phone desk.
                  </p>
                </div>
                <button 
                  onClick={() => handleDismiss()}
                  className="p-1.5 hover:bg-slate-850 rounded-full text-slate-500 hover:text-white transition-colors cursor-pointer shrink-0 mt-0.5"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Special Instructions for iPhone/Safari */}
              {isIOS && downloadState === "idle" && (
                <div className="text-left bg-slate-900/40 p-4 rounded-xl border border-slate-800/60 text-xs text-slate-300">
                  <p className="font-bold text-amber-500 mb-1 flex items-center gap-1">
                    <Share className="w-3.5 h-3.5 inline" /> Apple Safari Setup:
                  </p>
                  Tap the Share button <span className="text-white font-bold inline">📤</span> in your browser menu, then scroll down and tap <span className="text-white font-bold inline-flex items-center gap-0.5">Add to Home Screen <Plus className="w-3 h-3 text-amber-500 animate-pulse" /></span>.
                </div>
              )}

              {/* UI for standard downloading state */}
              {downloadState === "downloading" && (
                <div className="bg-slate-950/70 border border-slate-800/80 p-5 rounded-2xl flex flex-col gap-3 text-left">
                  <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
                    <span>📥 Downloading App Components...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-amber-500 h-full rounded-full"
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* UI for completed download state */}
              {downloadState === "completed" && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-green-950/30 border border-green-800/40 p-4 rounded-2xl flex items-center justify-center gap-2.5 text-green-400 text-xs font-extrabold text-center"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
                  App package downloaded successfully!
                </motion.div>
              )}

              {/* Simple classic buttons row: visible only during idle state */}
              {downloadState === "idle" && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleDismiss()}
                    className="w-1/2 py-3 bg-slate-900 hover:bg-slate-810 text-slate-300 border border-slate-800/80 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    id="btn-dismiss-pwa"
                  >
                    Not Now
                  </button>

                  <button
                    onClick={handleInstallClick}
                    className="w-1/2 py-3 bg-white hover:bg-slate-100 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-all cursor-pointer"
                    id="btn-install-pwa"
                  >
                    <Download className="w-4 h-4 stroke-[2.5]" strokeWidth={2.5} />
                    Download App
                  </button>
                </div>
              )}
            </motion.div>
            
          </div>
        )}
      </AnimatePresence>

      {/* Manual option modal: Keep as hidden fallback or simple helper */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md select-none">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-left"
              id="pwa-custom-guide-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5 text-white font-sans">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Installing Cash Earn</h3>
                    <p className="text-[11px] text-slate-400">Save app directly to your device desktop</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 hover:bg-slate-850 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-4 text-slate-300 text-xs">
                <p className="text-slate-400 leading-relaxed text-xs">
                  To save this application on your mobile desktop:
                </p>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 font-sans">
                  <div className="flex gap-3 text-left">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</div>
                    <p className="leading-snug text-slate-300">
                      Tap the <span className="font-bold text-white text-xs">Menu (⋮)</span> or <span className="font-bold text-white text-xs">Share Button (📤)</span> at the top/bottom section of your browser screen.
                    </p>
                  </div>
                  <div className="flex gap-3 text-left border-t border-slate-800/50 pt-2.5">
                    <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</div>
                    <p className="leading-snug text-slate-300">
                      Select <span className="font-bold text-amber-400 text-xs">"Install app"</span> or <span className="font-bold text-amber-400 text-xs">"Add to Home screen"</span> option.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-800/50 pt-2 flex items-center justify-between">
                  <span>PWA Standard Ready</span>
                  <span className="text-green-500 font-bold">● Available offline</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <a
                  href="website.zip"
                  download="CashEarn-Applet-v1.zip"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.25)] transition-all cursor-pointer text-center no-underline"
                >
                  <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" strokeWidth={2.5} />
                  Download App Package (.zip)
                </a>

                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-extrabold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
