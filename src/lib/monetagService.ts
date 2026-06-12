import { Capacitor } from '@capacitor/core';

export class MonetagService {
  public static MONETAG_TAG = '7b5edfb692ef413093ac9073ec0b03ab';

  /**
   * Helper to determine if we are running in a native webview under Android or iOS.
   */
  public static isNative(): boolean {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  }

  /**
   * Simulator trigger for Monetag video and smart link rewards.
   */
  public static playSimulatedAd(onComplete: () => void) {
    console.log("Monetag Ad Network: Initiating simulated ad experience...");
    setTimeout(() => {
      onComplete();
    }, 4000);
  }
}
