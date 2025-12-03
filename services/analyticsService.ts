/**
 * Analytics Service
 * 
 * Tracks page views, sessions, and web vitals.
 * Data is stored in Supabase for the admin dashboard.
 */

import { supabase } from './supabaseClient';

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('iconic_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('iconic_session_id', sessionId);
  }
  return sessionId;
};

// Get visitor's country from timezone (basic approximation)
const getCountryFromTimezone = (): string | null => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const countryMap: Record<string, string> = {
      'Europe/Prague': 'Czech Republic',
      'Europe/Bratislava': 'Slovakia',
      'Europe/Berlin': 'Germany',
      'Europe/Vienna': 'Austria',
      'Europe/Warsaw': 'Poland',
      'Europe/London': 'United Kingdom',
      'America/New_York': 'United States',
      'America/Los_Angeles': 'United States',
      'America/Chicago': 'United States',
      'America/Mexico_City': 'Mexico',
    };
    
    // Check for partial matches
    for (const [tz, country] of Object.entries(countryMap)) {
      if (timezone.includes(tz.split('/')[1])) {
        return country;
      }
    }
    
    // Extract region from timezone
    const region = timezone.split('/')[0];
    if (region === 'Europe') return 'Europe';
    if (region === 'America') return 'Americas';
    if (region === 'Asia') return 'Asia';
    
    return null;
  } catch {
    return null;
  }
};

// Track page view
export const trackPageView = async (path: string): Promise<void> => {
  try {
    const sessionId = getSessionId();
    const startTime = Date.now();
    
    // Store start time for duration calculation
    sessionStorage.setItem('iconic_page_start', startTime.toString());
    sessionStorage.setItem('iconic_current_path', path);

    const pageViewData = {
      path,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      screen_width: window.innerWidth,
      screen_height: window.innerHeight,
      language: navigator.language,
      country: getCountryFromTimezone(),
      session_id: sessionId,
      duration_seconds: null, // Will be updated on page leave
    };

    await (supabase as any).from('page_views').insert(pageViewData);
  } catch (error) {
    // Silently fail - don't break the app for analytics
    console.debug('Analytics tracking error:', error);
  }
};

// Update page view duration when leaving
export const trackPageLeave = async (): Promise<void> => {
  try {
    const startTime = sessionStorage.getItem('iconic_page_start');
    const currentPath = sessionStorage.getItem('iconic_current_path');
    const sessionId = getSessionId();

    if (startTime && currentPath) {
      const duration = Math.round((Date.now() - parseInt(startTime)) / 1000);
      
      // Update the most recent page view for this session and path
      await (supabase as any)
        .from('page_views')
        .update({ duration_seconds: duration })
        .eq('session_id', sessionId)
        .eq('path', currentPath)
        .is('duration_seconds', null)
        .order('created_at', { ascending: false })
        .limit(1);
    }
  } catch (error) {
    console.debug('Analytics tracking error:', error);
  }
};

// Track Web Vitals
export const trackWebVital = async (metric: {
  name: string;
  value: number;
  rating: string;
}): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    await (supabase as any).from('web_vitals').insert({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      path: window.location.pathname,
      session_id: sessionId,
    });
  } catch (error) {
    console.debug('Web vitals tracking error:', error);
  }
};

// Track custom events
export const trackEvent = async (
  eventName: string,
  properties?: Record<string, any>
): Promise<void> => {
  try {
    const sessionId = getSessionId();
    
    await (supabase as any).from('analytics_events').insert({
      event_name: eventName,
      properties: properties || {},
      path: window.location.pathname,
      session_id: sessionId,
    });
  } catch (error) {
    console.debug('Event tracking error:', error);
  }
};

// Initialize analytics - call this in App.tsx
export const initAnalytics = (): void => {
  // Track page leave on beforeunload
  window.addEventListener('beforeunload', () => {
    trackPageLeave();
  });

  // Track page leave on visibility change (mobile)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      trackPageLeave();
    }
  });

  // Track Web Vitals if available
  if ('PerformanceObserver' in window) {
    try {
      // LCP
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        trackWebVital({
          name: 'LCP',
          value: lastEntry.startTime,
          rating: lastEntry.startTime <= 2500 ? 'good' : lastEntry.startTime <= 4000 ? 'needs-improvement' : 'poor'
        });
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // FID
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          trackWebVital({
            name: 'FID',
            value: entry.processingStart - entry.startTime,
            rating: entry.processingStart - entry.startTime <= 100 ? 'good' : 
                   entry.processingStart - entry.startTime <= 300 ? 'needs-improvement' : 'poor'
          });
        });
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // CLS
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Report CLS on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && clsValue > 0) {
          trackWebVital({
            name: 'CLS',
            value: clsValue,
            rating: clsValue <= 0.1 ? 'good' : clsValue <= 0.25 ? 'needs-improvement' : 'poor'
          });
        }
      });
    } catch (e) {
      // PerformanceObserver not fully supported
    }
  }
};

export default {
  trackPageView,
  trackPageLeave,
  trackWebVital,
  trackEvent,
  initAnalytics
};
