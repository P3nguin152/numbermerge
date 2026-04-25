import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { View } from 'react-native';
import { DevSettings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeAdTracking, logAdImpression, getAggregatedStats } from '../services/adTrackingService';
import mobileAds, { 
  MaxAdContentRating,
  InterstitialAd,
  AdEventType,
  RewardedAd,
  RewardedAdEventType,
  BannerAd,
  BannerAdSize,
  TestIds
} from 'react-native-google-mobile-ads';

interface AdContextType {
  isInitialized: boolean;
  loadInterstitial: () => void;
  showInterstitial: () => Promise<boolean>;
  loadRewarded: () => void;
  showRewarded: () => Promise<{ rewarded: boolean; amount: number }>;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

const INTERSTITIAL_PRODUCTION_ID = 'ca-app-pub-3940256099942544/1033173712';
const REWARDED_PRODUCTION_ID = 'ca-app-pub-3940256099942544/5224354917';
const BANNER_PRODUCTION_ID = 'ca-app-pub-3940256099942544/6300978111';

const AD_KEYWORDS = ['puzzle', 'game', 'brain', 'logic'];
const AD_REQUEST_OPTIONS = {
  requestNonPersonalizedAdsOnly: false,
  keywords: AD_KEYWORDS,
};

const getAdUnitId = (productionId: string, testId: string) => (__DEV__ ? testId : productionId);

const INTERSTITIAL_AD_UNIT_ID = getAdUnitId(INTERSTITIAL_PRODUCTION_ID, TestIds.INTERSTITIAL);
const REWARDED_AD_UNIT_ID = getAdUnitId(REWARDED_PRODUCTION_ID, TestIds.REWARDED);
const BANNER_AD_UNIT_ID = getAdUnitId(BANNER_PRODUCTION_ID, TestIds.BANNER);

export function AdProvider({ children }: { children: ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);
  const interstitialAdRef = useRef<InterstitialAd | null>(null);
  const rewardedAdRef = useRef<RewardedAd | null>(null);

  // Use refs to store unsubscribe functions to prevent memory leaks
  const interstitialUnsubscribers = useRef<(() => void)[]>([]);
  const rewardedUnsubscribers = useRef<(() => void)[]>([]);
  const interstitialRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rewardedRetryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeAds();
    initializeAdTracking(); // Initialize ad tracking
    
    // Cleanup on unmount
    return () => {
      interstitialUnsubscribers.current.forEach(unsub => unsub());
      rewardedUnsubscribers.current.forEach(unsub => unsub());
      if (interstitialRetryTimeoutRef.current) {
        clearTimeout(interstitialRetryTimeoutRef.current);
      }
      if (rewardedRetryTimeoutRef.current) {
        clearTimeout(rewardedRetryTimeoutRef.current);
      }
    };
  }, []);

  const initializeAds = async () => {
    try {
      await mobileAds().setRequestConfiguration({
        // Configure for 13+ audience (PG rating) to align with target audience
        maxAdContentRating: MaxAdContentRating.PG,
      });
      
      await mobileAds().initialize();
      setIsInitialized(true);
      
      // Add Ad Inspector to dev menu
      if (__DEV__) {
        DevSettings.addMenuItem('Open AdMob Ad Inspector', async () => {
          try {
            await mobileAds().openAdInspector();
          } catch (error) {
            console.error('Failed to open Ad Inspector:', error);
          }
        });

        // Add ad revenue stats to dev menu
        DevSettings.addMenuItem('View Ad Revenue Stats', async () => {
          await getAggregatedStats();
        });

        // Add daily challenge completion to dev menu
        DevSettings.addMenuItem('Complete Daily Challenge', async () => {
          try {
            const username = await AsyncStorage.getItem('@numbermerge_username');
            if (!username) {
              console.error('No username found. Please set a username first.');
              return;
            }

            // Dynamic import to avoid circular dependencies
            const { dailyChallengeService } = await import('../services/dailyChallengeService');
            const challenge = await dailyChallengeService.getTodayChallenge();
            const result = await dailyChallengeService.submitChallengeAttempt(
              username,
              challenge,
              999999, // High score to ensure completion
              2048, // High tile value
              true // Mark as completed
            );

            if (result.success) {
              console.log('Daily challenge marked as complete! Streak:', result.streak);
            } else {
              console.error('Failed to complete daily challenge:', result.error);
            }
          } catch (error) {
            console.error('Error completing daily challenge:', error);
          }
        });
      }
      
      // Load ads after initialization
      loadInterstitial();
      loadRewarded();
    } catch (error) {
      console.error('AdMob initialization error:', error);
    }
  };

  const loadInterstitial = () => {
    interstitialUnsubscribers.current.forEach(unsub => unsub());
    interstitialUnsubscribers.current = [];

    const interstitial = InterstitialAd.createForAdRequest(INTERSTITIAL_AD_UNIT_ID, AD_REQUEST_OPTIONS);
    interstitialAdRef.current = interstitial;

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      if (interstitialRetryTimeoutRef.current) {
        clearTimeout(interstitialRetryTimeoutRef.current);
        interstitialRetryTimeoutRef.current = null;
      }
      setInterstitialLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setInterstitialLoaded(false);
      loadInterstitial(); // Preload next ad
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Interstitial ad error:', error);
      setInterstitialLoaded(false);
      if (interstitialRetryTimeoutRef.current) {
        clearTimeout(interstitialRetryTimeoutRef.current);
      }
      interstitialRetryTimeoutRef.current = setTimeout(() => loadInterstitial(), 30000);
    });

    interstitial.load();

    interstitialUnsubscribers.current = [unsubscribeLoaded, unsubscribeClosed, unsubscribeError];
  };

  const showInterstitial = async (): Promise<boolean> => {
    if (!interstitialLoaded || !interstitialAdRef.current) {
      console.log('Interstitial ad not loaded yet');
      return false;
    }

    try {
      await interstitialAdRef.current.show();
      logAdImpression('interstitial'); // Track impression
      return true;
    } catch (error) {
      console.error('Error showing interstitial ad:', error);
      return false;
    }
  };

  const loadRewarded = () => {
    rewardedUnsubscribers.current.forEach(unsub => unsub());
    rewardedUnsubscribers.current = [];

    const rewarded = RewardedAd.createForAdRequest(REWARDED_AD_UNIT_ID, AD_REQUEST_OPTIONS);
    rewardedAdRef.current = rewarded;

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      if (rewardedRetryTimeoutRef.current) {
        clearTimeout(rewardedRetryTimeoutRef.current);
        rewardedRetryTimeoutRef.current = null;
      }
      setRewardedLoaded(true);
    });

    const unsubscribeClosed = rewarded.addAdEventListener(AdEventType.CLOSED, () => {
      setRewardedLoaded(false);
      loadRewarded(); // Preload next ad
    });
    
    const unsubscribeError = rewarded.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('Rewarded ad error:', error);
      setRewardedLoaded(false);
      if (rewardedRetryTimeoutRef.current) {
        clearTimeout(rewardedRetryTimeoutRef.current);
      }
      rewardedRetryTimeoutRef.current = setTimeout(() => loadRewarded(), 30000);
    });

    rewarded.load();

    rewardedUnsubscribers.current = [unsubscribeLoaded, unsubscribeClosed, unsubscribeError];
  };

  const showRewarded = async (): Promise<{ rewarded: boolean; amount: number }> => {
    if (!rewardedLoaded || !rewardedAdRef.current) {
      console.log('Rewarded ad not loaded yet');
      return { rewarded: false, amount: 0 };
    }

    try {
      let rewardAmount = 0;
      let rewardEarned = false;

      const unsubscribeEarned = rewardedAdRef.current.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        (reward) => {
          rewardAmount = reward.amount;
          rewardEarned = true;
        },
      );

      await rewardedAdRef.current.show();
      logAdImpression('rewarded'); // Track impression
      unsubscribeEarned();

      return { rewarded: rewardEarned, amount: rewardAmount };
    } catch (error) {
      console.error('Error showing rewarded ad:', error);
      return { rewarded: false, amount: 0 };
    }
  };

  return (
    <AdContext.Provider
      value={{
        isInitialized,
        loadInterstitial,
        showInterstitial,
        loadRewarded,
        showRewarded,
      }}
    >
      {children}
    </AdContext.Provider>
  );
}

export function useAds() {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
}

// Banner Ad component for easy use in screens
export function AdBanner() {
  return (
    <View style={{ alignItems: 'center' }}>
      <BannerAd
        unitId={BANNER_AD_UNIT_ID}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={AD_REQUEST_OPTIONS}
        onAdLoaded={() => {
          logAdImpression('banner');
        }}
      />
    </View>
  );
}
