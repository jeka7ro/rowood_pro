// Session ID Management
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getSessionId = () => {
  let sessionId = localStorage.getItem('rowood_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('rowood_session_id', sessionId);
  }
  return sessionId;
};

// Device and Browser Detection
const getDeviceType = () => {
  const ua = navigator.userAgent;
  if (/mobile/i.test(ua)) return 'mobile';
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  return 'desktop';
};

const getBrowserName = () => {
  const ua = navigator.userAgent.toLowerCase();
  
  if (ua.includes('chrome') && !ua.includes('edg') && !ua.includes('opr')) {
    return 'Chrome';
  }
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  
  return 'Unknown';
};

// 🔥 MULTI-SOURCE IP & LOCATION DETECTION WITH FALLBACKS
let cachedLocationInfo = null;
let cacheTimestamp = null;
const CACHE_DURATION = 3600000; // 1 hour

const getLocationInfo = async () => {
  // Return cached data if available and not expired
  if (cachedLocationInfo && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
    console.log('[ActivityTracker] 📦 Using cached location info:', cachedLocationInfo);
    return cachedLocationInfo;
  }

  console.log('[ActivityTracker] 🌍 Fetching IP & location...');

  // Strategy 1: Try Cloudflare headers (if behind Cloudflare)
  try {
    const cfResponse = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
    const cfData = await cfResponse.text();
    const cfLines = cfData.split('\n');
    const cfInfo = {};
    cfLines.forEach(line => {
      const [key, value] = line.split('=');
      if (key && value) cfInfo[key] = value;
    });
    
    if (cfInfo.ip) {
      console.log('[ActivityTracker] ✅ Cloudflare IP detected:', cfInfo.ip);
      
      // Get location from ip-api.com using the Cloudflare IP
      try {
        const locationResponse = await fetch(`https://ip-api.com/json/${cfInfo.ip}?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone`);
        const locationData = await locationResponse.json();
        
        if (locationData.status === 'success') {
          cachedLocationInfo = {
            ip_address: cfInfo.ip,
            country: locationData.country,
            country_code: locationData.countryCode,
            region: locationData.regionName,
            city: locationData.city,
            timezone: locationData.timezone
          };
          cacheTimestamp = Date.now();
          console.log('[ActivityTracker] ✅ Location from Cloudflare + ip-api:', cachedLocationInfo);
          return cachedLocationInfo;
        }
      } catch (err) {
        console.warn('[ActivityTracker] ⚠️ ip-api failed for Cloudflare IP:', err);
      }
    }
  } catch (error) {
    console.warn('[ActivityTracker] ⚠️ Cloudflare trace failed:', error);
  }

  // Strategy 2: ipapi.co (free, no key, CORS friendly)
  try {
    console.log('[ActivityTracker] 🔄 Trying ipapi.co...');
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.ip && !data.error) {
        cachedLocationInfo = {
          ip_address: data.ip,
          country: data.country_name,
          country_code: data.country_code,
          region: data.region,
          city: data.city,
          timezone: data.timezone
        };
        cacheTimestamp = Date.now();
        console.log('[ActivityTracker] ✅ Location from ipapi.co:', cachedLocationInfo);
        return cachedLocationInfo;
      }
    }
  } catch (error) {
    console.warn('[ActivityTracker] ⚠️ ipapi.co failed:', error);
  }

  // Strategy 3: ip-api.com (original)
  try {
    console.log('[ActivityTracker] 🔄 Trying ip-api.com...');
    const response = await fetch('https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,lat,lon,timezone,query');
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        cachedLocationInfo = {
          ip_address: data.query,
          country: data.country,
          country_code: data.countryCode,
          region: data.regionName,
          city: data.city,
          timezone: data.timezone
        };
        cacheTimestamp = Date.now();
        console.log('[ActivityTracker] ✅ Location from ip-api.com:', cachedLocationInfo);
        return cachedLocationInfo;
      }
    }
  } catch (error) {
    console.warn('[ActivityTracker] ⚠️ ip-api.com failed:', error);
  }

  // Strategy 4: ipify.org + ipapi.com combination
  try {
    console.log('[ActivityTracker] 🔄 Trying ipify.org for IP only...');
    const ipResponse = await fetch('https://api.ipify.org?format=json');
    const ipData = await ipResponse.json();
    
    if (ipData.ip) {
      console.log('[ActivityTracker] ✅ IP from ipify.org:', ipData.ip);
      
      // Now get location from ipapi.com with the IP
      try {
        const locationResponse = await fetch(`https://ipapi.com/json/${ipData.ip}`);
        const locationData = await locationResponse.json();
        
        cachedLocationInfo = {
          ip_address: ipData.ip,
          country: locationData.country_name || null,
          country_code: locationData.country_code || null,
          region: locationData.region_name || null,
          city: locationData.city || null,
          timezone: locationData.time_zone?.id || null
        };
        cacheTimestamp = Date.now();
        console.log('[ActivityTracker] ✅ Location from ipify + ipapi:', cachedLocationInfo);
        return cachedLocationInfo;
      } catch (err) {
        // At least we have the IP
        cachedLocationInfo = {
          ip_address: ipData.ip,
          country: null,
          country_code: null,
          region: null,
          city: null,
          timezone: null
        };
        cacheTimestamp = Date.now();
        console.log('[ActivityTracker] ⚠️ Only IP available from ipify:', cachedLocationInfo);
        return cachedLocationInfo;
      }
    }
  } catch (error) {
    console.warn('[ActivityTracker] ⚠️ ipify.org failed:', error);
  }

  // Strategy 5: Last resort - just get IP from ipify
  try {
    console.log('[ActivityTracker] 🔄 Last resort: ipify.org only...');
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    
    if (data.ip) {
      cachedLocationInfo = {
        ip_address: data.ip,
        country: null,
        country_code: null,
        region: null,
        city: null,
        timezone: null
      };
      cacheTimestamp = Date.now();
      console.log('[ActivityTracker] ⚠️ Only IP available (last resort):', cachedLocationInfo);
      return cachedLocationInfo;
    }
  } catch (error) {
    console.error('[ActivityTracker] ❌ All IP detection methods failed:', error);
  }

  // Complete fallback
  console.error('[ActivityTracker] ❌ Could not get IP/location from any source');
  return {
    ip_address: null,
    country: null,
    country_code: null,
    region: null,
    city: null,
    timezone: null
  };
};

class ActivityTracker {
  constructor() {
    this.sessionId = getSessionId();
    this.pageStartTime = Date.now();
    this.pendingDuration = null;
    
    // Pre-fetch location info on init to have it ready
    this.locationInfoPromise = getLocationInfo();
  }

  hasConsent() {
    const consent = localStorage.getItem('rowood-cookies-accepted') === 'true';
    console.log('[ActivityTracker] 🍪 Cookie consent check:', consent);
    return consent;
  }

  async logActivity(activityType, metadata = {}) {
    if (!this.hasConsent()) {
      console.log('[ActivityTracker] ⚠️ No consent, skipping tracking');
      return;
    }

    try {
      let userId = null;
      let userEmail = null;

      try {
        const { base44 } = await import('@/api/base44Client');
        const user = await base44.auth.me().catch(() => null);
        if (user) {
          userId = user.id;
          userEmail = user.email;
        }
      } catch (error) {
        console.debug('[ActivityTracker] User not authenticated');
      }

      // Wait for location info (using cached or fresh)
      const locationInfo = await this.locationInfoPromise;
      console.log('[ActivityTracker] 📝 Logging activity:', activityType, 'with location:', locationInfo);

      const activityData = {
        session_id: this.sessionId,
        user_id: userId,
        user_email: userEmail,
        activity_type: activityType,
        page_name: window.location.pathname.split('/').pop() || 'Home',
        page_url: window.location.href,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        device_type: getDeviceType(),
        browser: getBrowserName(),
        ip_address: locationInfo.ip_address,
        country: locationInfo.country,
        country_code: locationInfo.country_code,
        city: locationInfo.city,
        region: locationInfo.region,
        metadata: metadata,
      };

      console.log('[ActivityTracker] 💾 Saving to database:', activityData);

      const { base44 } = await import('@/api/base44Client');
      const result = await base44.entities.ActivityLog.create(activityData);
      
      console.log('[ActivityTracker] ✅ Activity saved successfully:', result.id);
    } catch (error) {
      console.error('[ActivityTracker] ❌ Failed to log activity:', error);
    }
  }

  trackPageView(pageName) {
    console.log('[ActivityTracker] 📄 trackPageView called for:', pageName);
    console.log('[ActivityTracker] 🍪 Consent status:', this.hasConsent());
    this.pageStartTime = Date.now();
    this.logActivity('page_view');
  }

  trackPageLeave() {
    const duration = Math.floor((Date.now() - this.pageStartTime) / 1000);
    this.pendingDuration = duration;
  }

  async sendPendingDuration() {
    if (this.pendingDuration !== null) {
      try {
        const { base44 } = await import('@/api/base44Client');
        const recentLogs = await base44.entities.ActivityLog.filter(
          { session_id: this.sessionId, activity_type: 'page_view' },
          '-created_date',
          1
        );
        
        if (recentLogs && recentLogs.length > 0) {
          const lastLog = recentLogs[0];
          await base44.entities.ActivityLog.update(lastLog.id, {
            duration_seconds: this.pendingDuration
          });
          console.log('[ActivityTracker] ✅ Duration updated:', this.pendingDuration);
        }
      } catch (error) {
        console.warn('[ActivityTracker] ⚠️ Failed to send pending duration:', error);
      }
      this.pendingDuration = null;
    }
  }

  trackLogin(userEmail) {
    this.logActivity('login', { user_email: userEmail });
  }

  trackLogout(userEmail) {
    this.logActivity('logout', { user_email: userEmail });
  }

  trackAddToCart(productId, productName) {
    this.logActivity('add_to_cart', { product_id: productId, product_name: productName });
  }

  trackRemoveFromCart(productId) {
    this.logActivity('remove_from_cart', { product_id: productId });
  }

  trackCheckoutStart() {
    this.logActivity('checkout_start');
  }

  trackOrderPlaced(orderId, totalAmount) {
    this.logActivity('order_placed', { order_id: orderId, total_amount: totalAmount });
  }

  trackProductView(productId, productName) {
    this.logActivity('product_view', { product_id: productId, product_name: productName });
  }

  trackConfiguratorStart() {
    this.logActivity('configurator_start');
  }

  trackConfiguratorComplete(configId) {
    this.logActivity('configurator_complete', { config_id: configId });
  }
}

const tracker = new ActivityTracker();

// Debug info
console.log('[ActivityTracker] 🚀 Initialized with session:', tracker.sessionId);

export default tracker;