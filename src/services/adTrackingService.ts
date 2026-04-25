import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';

// Typical eCPM rates for estimation (in USD)
const ECPM_RATES = {
  interstitial: 1.5,
  rewarded: 7.0,
  banner: 0.75,
};

type AdType = 'interstitial' | 'rewarded' | 'banner';

const DEVICE_ID_KEY = '@ad_tracking_device_id';
const SESSION_ID_KEY = '@ad_tracking_session_id';

// Generate or retrieve device ID
async function getDeviceId(): Promise<string> {
  try {
    let deviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  } catch (error) {
    console.error('Error getting device ID:', error);
    return `device_${Date.now()}`;
  }
}

// Generate new session ID
async function generateSessionId(): Promise<string> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  try {
    await AsyncStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.error('Error saving session ID:', error);
  }
  return sessionId;
}

// Get current session ID
async function getSessionId(): Promise<string> {
  try {
    let sessionId = await AsyncStorage.getItem(SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = await generateSessionId();
    }
    return sessionId;
  } catch (error) {
    console.error('Error getting session ID:', error);
    return `session_${Date.now()}`;
  }
}

// Calculate estimated revenue based on ad type
function calculateEstimatedRevenue(adType: AdType): number {
  const ecpm = ECPM_RATES[adType] || 0;
  // Revenue = eCPM / 1000 (per impression)
  return ecpm / 1000;
}

// Log ad impression to Supabase
export async function logAdImpression(adType: AdType): Promise<void> {
  if (!__DEV__) {
    return; // Only track in development mode
  }

  try {
    const deviceId = await getDeviceId();
    const sessionId = await getSessionId();
    const estimatedRevenue = calculateEstimatedRevenue(adType);

    console.log(`[Ad Tracking] Logging impression: ${adType}, revenue: $${estimatedRevenue.toFixed(4)}, device: ${deviceId}`);

    const { error } = await supabase.from('ad_impressions').insert({
      ad_type: adType,
      estimated_revenue: estimatedRevenue,
      device_id: deviceId,
      session_id: sessionId,
    });

    if (error) {
      console.error('[Ad Tracking] Error logging impression:', error);
    }
  } catch (error) {
    console.error('[Ad Tracking] Error in logAdImpression:', error);
  }
}

// Get aggregated stats from Supabase
export async function getAggregatedStats(): Promise<void> {
  if (!__DEV__) {
    return;
  }

  try {
    // Get total impressions and revenue
    const { data: impressionsData, error: impressionsError } = await supabase
      .from('ad_impressions')
      .select('estimated_revenue');

    if (impressionsError) {
      console.error('[Ad Tracking] Error fetching impressions:', impressionsError);
      return;
    }

    // Get unique device count
    const { data: devicesData, error: devicesError } = await supabase
      .from('ad_impressions')
      .select('device_id');

    if (devicesError) {
      console.error('[Ad Tracking] Error fetching devices:', devicesError);
      return;
    }

    // Calculate stats
    const totalImpressions = impressionsData?.length || 0;
    const totalRevenue = impressionsData?.reduce((sum, item) => sum + (item.estimated_revenue || 0), 0) || 0;
    const uniqueDevices = new Set(devicesData?.map(d => d.device_id)).size;

    // Get breakdown by ad type
    const { data: typeData } = await supabase
      .from('ad_impressions')
      .select('ad_type, estimated_revenue');

    const breakdown: Record<string, { count: number; revenue: number }> = {
      interstitial: { count: 0, revenue: 0 },
      rewarded: { count: 0, revenue: 0 },
      banner: { count: 0, revenue: 0 },
    };

    typeData?.forEach(item => {
      const type = item.ad_type;
      if (breakdown[type]) {
        breakdown[type].count++;
        breakdown[type].revenue += item.estimated_revenue || 0;
      }
    });

    // Log stats
    console.log('\n=== AD REVENUE STATS ===');
    console.log(`Total Impressions: ${totalImpressions}`);
    console.log(`Total Estimated Revenue: $${totalRevenue.toFixed(4)}`);
    console.log(`Unique Devices: ${uniqueDevices}`);
    console.log('\n--- Breakdown by Ad Type ---');
    console.log(`Interstitial: ${breakdown.interstitial.count} impressions, $${breakdown.interstitial.revenue.toFixed(4)}`);
    console.log(`Rewarded: ${breakdown.rewarded.count} impressions, $${breakdown.rewarded.revenue.toFixed(4)}`);
    console.log(`Banner: ${breakdown.banner.count} impressions, $${breakdown.banner.revenue.toFixed(4)}`);
    console.log('========================\n');
  } catch (error) {
    console.error('[Ad Tracking] Error in getAggregatedStats:', error);
  }
}

// Initialize session ID on app start
export async function initializeAdTracking(): Promise<void> {
  if (!__DEV__) {
    return;
  }

  try {
    await getSessionId();
    console.log('[Ad Tracking] Initialized');
  } catch (error) {
    console.error('[Ad Tracking] Error initializing:', error);
  }
}
