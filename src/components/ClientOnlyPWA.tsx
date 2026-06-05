"use client";

import React, { useEffect, useState } from "react";
import PWAInstallPrompt from "./PWAInstallPrompt";

export default function ClientOnlyPWA() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <PWAInstallPrompt />;
}
