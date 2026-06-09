import { Capacitor } from '@capacitor/core';

export interface AdMobRewardDetails {
  type: string;
  amount: number;
}

export class AdMobService {
  private static isInitialized = false;
  private static activeListeners: any[] = [];

  // AdMob Custom Live Unit ID for Rewarded Ads
  public static REWARD_AD_UNIT_ID = 'ca-app-pub-1741947856013956/5702516294';

  /**
   * Helper to determine if we are running in a native webview under Android or iOS.
   */
  public static isNative(): boolean {
    return typeof window !== 'undefined' && Capacitor.isNativePlatform();
  }

  /**
   * Initializes the Google Mobile Ads SDK inside Capacitor.
   */
  public static async initialize(): Promise<boolean> {
    if (!this.isNative()) {
      console.log('AdMob: Non-native platform, running in simulated browser mode.');
      return false;
    }

    if (this.isInitialized) return true;

    try {
      const { AdMob } = await import('@capacitor-community/admob');
      await AdMob.initialize({
        initializeForTesting: false,
      });
      this.isInitialized = true;
      console.log('AdMob SDK: Native SDK initialized successfully.');
      return true;
    } catch (error) {
      console.error('AdMob SDK: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Prepares and displays a Rewarded Video Ad with premium callback progression.
   */
  public static async loadAndShowRewardedAd(
    onRewarded: (reward: AdMobRewardDetails) => void,
    onLoaded?: () => void,
    onFailedToLoad?: (error: any) => void,
    onFailedToShow?: (error: any) => void,
    onDismissed?: () => void
  ): Promise<void> {
    console.log('AdMob: Starting load and show flow for unit ID:', this.REWARD_AD_UNIT_ID);

    if (!this.isNative()) {
      // Browser fallback simulation - works beautifully in AI Studio web preview!
      console.log('AdMob Fallback: Simulating rewarded ad load...');
      if (onLoaded) {
        onLoaded();
      }
      
      // Simulate ad watch duration of 4 seconds for great UX, then trigger reward
      setTimeout(() => {
        console.log('AdMob Fallback: Simulating reward earned!');
        onRewarded({ type: 'coins', amount: 50 });
        if (onDismissed) {
          onDismissed();
        }
      }, 4000);
      return;
    }

    try {
      // Auto-initialize if not done yet
      await this.initialize();

      const { AdMob, RewardAdPluginEvents } = await import('@capacitor-community/admob');

      // Clear previous active listeners to prevent multiple callbacks accumulation
      await this.clearListeners();

      // Register Loaded Event
      const loadedL = await AdMob.addListener(
        RewardAdPluginEvents.Loaded,
        () => {
          console.log('AdMob SDK: Rewarded ad loaded and ready.');
          if (onLoaded) {
            onLoaded();
          }
        }
      );
      this.activeListeners.push(loadedL);

      // Register FailedToLoad Event
      const failedL = await AdMob.addListener(
        RewardAdPluginEvents.FailedToLoad,
        (error: any) => {
          console.error('AdMob SDK: Rewarded ad failed to load:', error);
          if (onFailedToLoad) {
            onFailedToLoad(error);
          }
          this.clearListeners();
        }
      );
      this.activeListeners.push(failedL);

      // Register Rewarded Event
      const rewardedL = await AdMob.addListener(
        RewardAdPluginEvents.Rewarded,
        (reward: any) => {
          console.log('AdMob SDK: User earned reward structure:', reward);
          onRewarded({
            type: reward?.type || 'coins',
            amount: reward?.amount ? Number(reward.amount) : 50
          });
        }
      );
      this.activeListeners.push(rewardedL);

      // Register Dismissed Event
      const dismissedL = await AdMob.addListener(
        RewardAdPluginEvents.Dismissed,
        () => {
          console.log('AdMob SDK: Rewarded ad was dismissed.');
          if (onDismissed) {
            onDismissed();
          }
          this.clearListeners();
        }
      );
      this.activeListeners.push(dismissedL);

      // Register FailedToShow Event
      const failedShowL = await AdMob.addListener(
        RewardAdPluginEvents.FailedToShow,
        (error: any) => {
          console.error('AdMob SDK: Rewarded ad failed to show:', error);
          if (onFailedToShow) {
            onFailedToShow(error);
          }
          this.clearListeners();
        }
      );
      this.activeListeners.push(failedShowL);

      // Prepare/Load Ad
      console.log('AdMob SDK: Preparing rewarded ad options with unit ID:', this.REWARD_AD_UNIT_ID);
      await AdMob.prepareRewardVideoAd({
        adId: this.REWARD_AD_UNIT_ID,
        isTesting: false,
      });

      // Show/Display Ad
      console.log('AdMob SDK: Displaying loaded rewarded ad...');
      await AdMob.showRewardVideoAd();

    } catch (err: any) {
      console.error('AdMob SDK: Exception in load and show flow:', err);
      if (onFailedToShow) {
        onFailedToShow(err);
      }
      await this.clearListeners();
    }
  }

  /**
   * Cleans up registered Capacitor listeners safely.
   */
  public static async clearListeners(): Promise<void> {
    if (this.activeListeners.length > 0) {
      try {
        for (const listener of this.activeListeners) {
          if (listener && typeof listener.remove === 'function') {
            await listener.remove();
          }
        }
      } catch (err) {
        console.warn('AdMob SDK: Error cleaning listener handles:', err);
      }
      this.activeListeners = [];
    }
  }
}
