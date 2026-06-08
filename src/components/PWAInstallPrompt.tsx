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
  CheckCircle2,
  AlertTriangle,
  Info
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

  // Advanced Browser & WebView detection for smart instructions
  const [browserTab, setBrowserTab] = useState<"chrome" | "safari" | "other" | "webview">("chrome");
  const [detectedBrowser, setDetectedBrowser] = useState("Chrome");

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

    // 3. Detect User Agent and Browser patterns
    const detectEnvironment = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isSafariBrowser = !/crios|fxios|opera|twitter|fb_iab|instagram|whatsapp/i.test(userAgent) && /safari/.test(userAgent);
      
      const isFacebook = /fb_iab|fbav/i.test(userAgent);
      const isInstagram = /instagram/i.test(userAgent);
      const isWhatsApp = /whatsapp/i.test(userAgent);
      const isTelegram = /telegram/i.test(userAgent);
      const isMessenger = /messenger/i.test(userAgent);
      
      const isInAppWebView = isFacebook || isInstagram || isWhatsApp || isTelegram || isMessenger || (isApple && !isSafariBrowser && /applewebkit/i.test(userAgent) && !/safari/i.test(userAgent));
      const isFirefoxBrowser = /firefox|fxios/.test(userAgent);
      const isSamsungBrowser = /samsungbrowser/.test(userAgent);
      const isOperaBrowser = /opera|opr|opios/.test(userAgent);

      setIsIOS(isApple && isSafariBrowser);

      if (isInAppWebView) {
        setBrowserTab("webview");
        setDetectedBrowser("In-App Browser (e.g., WhatsApp / Instagram)");
      } else if (isApple && isSafariBrowser) {
        setBrowserTab("safari");
        setDetectedBrowser("Safari");
      } else if (isFirefoxBrowser || isSamsungBrowser || isOperaBrowser) {
        setBrowserTab("other");
        if (isFirefoxBrowser) setDetectedBrowser("Firefox");
        else if (isSamsungBrowser) setDetectedBrowser("Samsung Internet");
        else setDetectedBrowser("Opera");
      } else {
        setBrowserTab("chrome");
        setDetectedBrowser("Chrome");
      }
    };
    detectEnvironment();

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

  // Perform browser installation or start dynamic backup download trigger
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
        // Iframe environment blocked trigger fallback
        window.open(window.location.href, "_blank");
      } else {
        // Start premium simulated direct downloader sequencer which works globally
        setDownloadState("downloading");
        setDownloadProgress(0);
        
        const interval = setInterval(() => {
          setDownloadProgress((prev) => {
            if (prev >= 100) {
              clearInterval(interval);
              setDownloadState("completed");
              
              // Programmatically trigger download of the backup standalone app package
              try {
                const link = document.createElement("a");
                link.href = "website.zip";
                link.download = "CashEarn-Web-App.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              } catch (e) {
                console.error("Direct download execution error:", e);
              }

              // Dismiss prompt with a delay
              setTimeout(() => {
                setShowPrompt(false);
              }, 1800);

              return 100;
            }
            return prev + 10;
          });
        }, 100);
      }
    }
  };

  const handleOpenNewWindow = () => {
    window.open(window.location.href, "_blank");
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      <AnimatePresence>
        {showPrompt && (
          <div 
            className="fixed inset-0 z-[999999] p-4 flex items-center justify-center bg-black/75 backdrop-blur-[4px] select-none text-white outline-none"
            onClick={() => handleDismiss()}
          >
            {/* Main Interactive Prompt Card */}
            <motion.div
              initial={{ scale: 0.93, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.93, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35 }}
              className="w-full max-w-xl bg-[#0B121E] border border-slate-800 rounded-3xl p-6 md:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.85)] flex flex-col gap-5 text-left text-slate-100"
              id="pwa-normal-prompt"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header section */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-[#14223A] rounded-2xl flex items-center justify-center p-0.5 border border-amber-500/30 shadow-lg shrink-0">
                  <img src="icon.svg" alt="App Icon" className="w-full h-full rounded-2xl object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-extrabold text-[#F59E0B] tracking-wide font-sans">
                      MONEY APP
                    </h4>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                      Safe & Live
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 lines-clamp-2">
                    अपने फ़ोन में सीधे इनस्टॉल करें और आसानी से टास्क खेलकर पैसे निकालें। (Works seamlessly on any browser)
                  </p>
                </div>
                <button 
                  onClick={() => handleDismiss()}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
                  title="Dismiss"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Special Warning if inside AI Studio Preview Frame */}
              {isInIframe && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex gap-3 items-start text-xs text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold text-amber-400 block mb-0.5">⚠️ Chrome Frame Warning (AI Studio):</span>
                    इन-ऐप प्रिव्यू फ्रेम में डायरेक्ट डाऊनलोड बटन काम नहीं कर सकता। पूर्ण रूप से इनस्टॉल करने के लिए नीचे दिए गए बटन पर क्लिक कर के इसे नये ब्राउज़र टैब में खोलें।
                    <button
                      onClick={handleOpenNewWindow}
                      className="mt-2.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg transition-all text-[11px] flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open App in Google Chrome
                    </button>
                  </div>
                </div>
              )}

              {/* Multitasking Browser Tab Option Selector */}
              <div className="bg-[#121E31]/80 rounded-2xl p-1.5 flex gap-1 border border-slate-800">
                {[
                  { id: "chrome", label: "🤖 Chrome / Android", emoji: "🤖" },
                  { id: "safari", label: "🍏 iPhone Safari", emoji: "🍏" },
                  { id: "other", label: "🌐 Others", emoji: "🌐" },
                  { id: "webview", label: "📱 WhatsApp/Social", emoji: "📱" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setBrowserTab(tab.id as any)}
                    className={`flex-1 py-2 text-[10.5px] md:text-xs font-bold rounded-xl transition-all cursor-pointer text-center ${
                      browserTab === tab.id 
                        ? "bg-[#1E2E44] text-[#F59E0B] shadow-sm border border-slate-700/60" 
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                    }`}
                  >
                    <span className="block md:inline mr-1">{tab.emoji}</span>
                    <span className="hidden md:inline">{tab.label.split(" ").slice(1).join(" ")}</span>
                    <span className="md:hidden inline">{tab.label.split(" ")[1]}</span>
                  </button>
                ))}
              </div>

              {/* Step-by-Step Instructions Area based on chosen browser tab */}
              <div className="bg-[#0e1726]/60 border border-slate-800/80 rounded-2xl p-4 md:p-5">
                {browserTab === "chrome" && (
                  <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                    <div className="flex gap-2 text-slate-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <span>Google Chrome / Android Setup</span>
                      <span>• Default</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                      <p className="leading-relaxed">
                        निचे मौजूद <strong className="text-white">"Download & Install App"</strong> बटन पर क्लिक करें।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                      <p className="leading-relaxed">
                        स्क्रीन पर पॉपअप आने पर <strong className="text-amber-400">"Install"</strong> या <strong className="text-amber-400">"Add to Home Screen"</strong> पर टैप करें।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">3</div>
                      <p className="leading-relaxed">
                        वैकल्पिक रूप से, अपने Chrome की ऊपरी दायीं ओर मौजूद <strong className="text-white">तीन डॉट्स (⋮)</strong> दबाकर भी <strong>"Install App"</strong> कर सकते हैं।
                      </p>
                    </div>
                  </div>
                )}

                {browserTab === "safari" && (
                  <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                    <div className="flex gap-2 text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <span>Apple iOS Safari Instructions (iPhone)</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                      <p className="leading-relaxed">
                        Safari ब्राउज़र की नीचे दी गयी टूलबार में मौजूद <strong className="text-white">Share (📤) / शेयर</strong> बटन दबाएं।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                      <p className="leading-relaxed">
                        मेन्यू को नीचे स्क्रॉल करें तथा <strong className="text-amber-400">"Add to Home Screen" (होम स्क्रीन में जोड़ें)</strong> को चुनें।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">3</div>
                      <p className="leading-relaxed">
                        ऊपर दायें कोने में दिए <strong className="text-white">"Add"</strong> पर टैप करें। ऐप आपके डेस्कटॉप आइकॉन पर तुरंत सेव हो जायेगा।
                      </p>
                    </div>
                  </div>
                )}

                {browserTab === "other" && (
                  <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                    <div className="flex gap-2 text-blue-400 font-extrabold uppercase tracking-wider text-[10px]">
                      <span>Firefox / Opera / Samsung Internet Guideline</span>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                      <p className="leading-relaxed">
                        अपने ब्राउज़र के सबसे निचले अथवा ऊपरी हिस्से में मौजूद <strong className="text-white">मेन्यू डॉट्स (⋮) या हैमबर्गर (≡)</strong> बटन पर जाएँ।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                      <p className="leading-relaxed">
                        वहाँ मिलने वाले <strong className="text-amber-400">"Install App"</strong> या <strong>"Add to Home Screen"</strong> ऑप्शन पर क्लिक करें।
                      </p>
                    </div>
                  </div>
                )}

                {browserTab === "webview" && (
                  <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                    <div className="bg-amber-950/40 border border-amber-900/60 p-3 rounded-xl flex items-start gap-2.5 text-amber-400 text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <strong className="block mb-0.5">⚠️ इन-ऐप वेबव्यू डिटेक्ट किया गया (WhatsApp / Messenger / Instagram)</strong>
                        व्हाट्सप्प या सोशल मीडिया में सीधे खुले लिंक में इनस्टॉल और बैकअप डाउनलोड काम नहीं करता। कृपया इसे पहले बाहरी क्रोम ब्राउज़र में खोलें।
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">1</div>
                      <p className="leading-relaxed text-slate-200">
                        ऊपरी दायें कोने में दिए गए <strong className="text-white">3 डॉट्स (⋮ या ...)</strong> दबाएँ।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">2</div>
                      <p className="leading-relaxed text-slate-200">
                        वहाँ <strong className="text-amber-400">"Open in Chrome"</strong> या <strong className="text-amber-400">"Open in Browser" (ब्राउज़र में खोलें)</strong> विकल्प को चुनें।
                      </p>
                    </div>
                    <div className="flex gap-3 border-t border-slate-850 pt-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-[11px] shrink-0">3</div>
                      <p className="leading-relaxed text-slate-200">
                        क्रोम में खुलते ही नीचे दिख रहा <strong className="text-emerald-400">"Download & Install"</strong> बटन सफलतापूर्वक चालू हो जायेगा।
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Progress visualizer during backing downloads */}
              {downloadState === "downloading" && (
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
                    <span>📥 Downloading Safe Standalone Web-Package...</span>
                    <span>{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full"
                      animate={{ width: `${downloadProgress}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    This backup contains offline resources. Extract and click link to launch on your device.
                  </p>
                </div>
              )}

              {/* Completed visual state */}
              {downloadState === "completed" && (
                <motion.div 
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-emerald-950/40 border border-emerald-800/40 p-4 rounded-xl flex items-center justify-center gap-2 text-emerald-400 text-xs font-bold text-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  App Offline Backup package successfully downloaded!
                </motion.div>
              )}

              {/* Action buttons row */}
              {downloadState === "idle" && (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black rounded-2xl text-[13px] tracking-wide flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(245,158,11,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer border-none"
                    id="btn-install-pwa"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" strokeWidth={2.5} />
                    Download & Install App
                  </button>

                  <button
                    onClick={() => setShowGuideModal(true)}
                    className="py-4 px-5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold rounded-2xl text-[13px] border border-slate-700/60 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    title="Detailed installation options guide"
                  >
                    <Info className="w-4 h-4" /> Help Book
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2 shrink-0">
                <span>🛡️ Virus Free & Secure Standalone App</span>
                <button 
                  onClick={() => handleDismiss()}
                  className="text-slate-400 hover:text-white bg-transparent border-none cursor-pointer underline font-bold"
                  id="btn-dismiss-pwa"
                >
                  Maybe later / बाद में करें
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Backup Offline Package Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none text-white">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="w-full max-w-md bg-[#0D1524] border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-left"
              id="pwa-custom-guide-modal"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 bg-amber-500/10 text-amber-500 rounded-xl flex items-center justify-center border border-amber-500/20">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-[#F59E0B]">Install Guide Book</h3>
                    <p className="text-[10px] text-slate-400">सभी ब्राउज़र के लिए आसान गाइड बुक</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3.5 text-xs text-slate-300">
                <p className="leading-relaxed">
                  यदि डाइनलोड करने में कोई समस्या आ रही है, तो आप नीचे दिए गए दो तरीकों का उपयोग करें:
                </p>

                <div className="bg-[#121E31]/70 border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3 font-sans">
                  <div className="flex gap-2.5">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#1E2E44] text-[#F59E0B] flex items-center justify-center font-bold text-[10.5px] shrink-0 mt-0.5">A</div>
                    <div>
                      <span className="font-extrabold text-white block mb-0.5">Chrome Browser Setup (क्रिएटिव शॉर्टकट):</span>
                      कस्टम क्रोम का इस्तेमाल करें। ऊपर दायीं ओर मौजूद <strong>(⋮) बटन</strong> दबाकर <strong>"Add to Home Screen"</strong> पर टैप करें।
                    </div>
                  </div>
                  <div className="flex gap-2.5 border-t border-slate-800/60 pt-3">
                    <div className="w-5.5 h-5.5 rounded-full bg-[#1E2E44] text-[#F59E0B] flex items-center justify-center font-bold text-[10.5px] shrink-0 mt-0.5">B</div>
                    <div>
                      <span className="font-extrabold text-white block mb-0.5 font-sans">Download Backup .zip:</span>
                      आप नीचे दिए गए बटन पर क्लिक करके इस पूरी वेबसाइट का ऑफलाइन वर्किंग डेटा बैकअप एक क्लिक में डाऊनलोड कर सकते हैं।
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-slate-900 pt-1.5 flex items-center justify-between">
                  <span>PWA Security Version 1.0.4</span>
                  <span className="text-emerald-500 font-bold">● Standalone Mode Built</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <a
                  href="website.zip"
                  download="CashEarn-Applet-v1.zip"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(245,158,11,0.2)] transition-all cursor-pointer text-center no-underline"
                >
                  <Download className="w-4 h-4 text-slate-950 stroke-[2.5]" strokeWidth={2.5} />
                  Download Backup Package (.zip)
                </a>

                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-400 border border-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close Guide Book / बंद करें
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
