import { AdMob, AdMobRewardItem, RewardAdPluginEvents, AdMobError } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export class AdMobService {
  /**
   * Helper to determine if we are running in a native webview under Android or iOS.
   */
  public static isNative(): boolean {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  }

  /**
   * Initializes AdMob SDK (must be called before loading ads in native).
   */
  public static async initialize(): Promise<void> {
    if (!this.isNative()) return;
    try {
      await AdMob.initialize({
        testingDevices: [],
        initializeForTesting: true,
      });
      console.log("AdMob SDK initialized successfully.");
    } catch (error) {
      console.warn("AdMob initialization failed:", error);
    }
  }

  /**
   * Simulator or Native trigger for Google AdMob video rewards.
   */
  public static async loadAndShowRewardedAd(
    onRewarded: (reward: AdMobRewardItem) => void,
    onAdLoaded: () => void,
    onAdFailedToLoad: (error: any) => void,
    onAdFailedToShow: (error: any) => void,
    onAdDismissed: () => void
  ): Promise<void> {
    if (!this.isNative()) {
      // Return immediately for browser fallback/simulation
      onAdFailedToLoad(new Error("Running in browser sandbox. Falling back to simulator..."));
      return;
    }

    try {
      // Testing Unit IDs from Google AdMob documentation
      // Android Rewarded Ad test unit ID: ca-app-pub-3940256099942544/5224354917
      const adId = 'ca-app-pub-3940256099942544/5224354917';

      // 1. Listeners using correct library enums
      const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, (reward: AdMobRewardItem) => {
        onRewarded(reward);
      });

      const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
        onAdDismissed();
        rewardListener.remove();
        dismissListener.remove();
        failToShowListener.remove();
      });

      const failToShowListener = await AdMob.addListener(RewardAdPluginEvents.FailedToShow, (error: AdMobError) => {
        onAdFailedToShow(error);
        rewardListener.remove();
        dismissListener.remove();
        failToShowListener.remove();
      });

      // 2. Prepare/Load
      try {
        await AdMob.prepareRewardVideoAd({
          adId: adId,
          isTesting: true,
        });
        onAdLoaded();

        // 3. Show
        await AdMob.showRewardVideoAd();
      } catch (loadError: any) {
        onAdFailedToLoad(loadError);
        rewardListener.remove();
        dismissListener.remove();
        failToShowListener.remove();
      }
    } catch (setupError: any) {
      onAdFailedToLoad(setupError);
    }
  }
}
