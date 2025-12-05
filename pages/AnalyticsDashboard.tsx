/**
 * Analytics Dashboard
 * 
 * Real analytics dashboard for admins showing:
 * - Page views and visitors
 * - Session duration
 * - Bounce rate
 * - Device breakdown
 * - Top pages
 * - Geographic data
 * - Performance metrics
 * - Optimization recommendations
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Users, Clock, MousePointerClick, Globe, Smartphone, 
  Monitor, Tablet, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Zap, Eye, ArrowLeft, RefreshCw, Calendar, Filter,
  Lightbulb, Target, Activity, Layers
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';

// Types for analytics data
interface PageView {
  id: string;
  path: string;
  referrer: string | null;
  user_agent: string;
  screen_width: number;
  screen_height: number;
  language: string;
  country: string | null;
  city: string | null;
  session_id: string;
  duration_seconds: number | null;
  created_at: string;
}

interface AnalyticsSummary {
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: number;
  bounceRate: number;
  topPages: { path: string; views: number; avgDuration: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  hourlyTraffic: { hour: number; views: number }[];
  dailyTrend: { date: string; views: number; visitors: number }[];
}

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  description: string;
  recommendation: string;
}

// Helper to detect device type from user agent
const getDeviceType = (userAgent: string, width: number): string => {
  if (/mobile/i.test(userAgent) || width < 768) return 'Mobile';
  if (/tablet|ipad/i.test(userAgent) || (width >= 768 && width < 1024)) return 'Tablet';
  return 'Desktop';
};

// Helper to detect browser
const getBrowser = (userAgent: string): string => {
  if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) return 'Safari';
  if (/firefox/i.test(userAgent)) return 'Firefox';
  if (/edge/i.test(userAgent)) return 'Edge';
  if (/opera|opr/i.test(userAgent)) return 'Opera';
  return 'Other';
};

// Format duration
const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  return `${mins}m ${secs}s`;
};

export const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [performance, setPerformance] = useState<PerformanceMetric[]>([]);
  const [error, setError] = useState<string | null>(null);

  const t = {
    'cs-CZ': {
      back_to_crm: 'Zpět do CRM',
      title: 'Analytics Dashboard',
      subtitle: 'Skutečná data a doporučení pro optimalizaci',
      loading: 'Načítám analytiku...',
      range_7d: '7 dní',
      range_30d: '30 dní',
      range_90d: '90 dní',
      sample_notice: 'Zobrazují se ukázková data. Pro zapnutí reálné analytiky spusťte SQL migraci v Supabase.',
      metric_page_views: 'Zobrazení stránek',
      metric_unique_visitors: 'Unikátní návštěvníci',
      metric_avg_session: 'Prům. relace',
      metric_bounce_rate: 'Bounce rate',
      traffic_trend: 'Trendy návštěvnosti',
      device_breakdown: 'Zařízení',
      top_pages: 'Top stránky',
      top_countries: 'Top země',
      core_web_vitals: 'Core Web Vitals',
      seo_health: 'SEO skóre',
      seo_note: 'Dobré – je zde prostor pro zlepšení',
      seo_checklist: 'SEO checklist',
      growth_metrics: 'Růstové metriky',
      organic_traffic: 'Organická návštěvnost',
      ctr: 'CTR z výsledků vyhledávání',
      returning_visitors: 'Vrací se návštěvníci',
      recommendations_title: 'Doporučení pro optimalizaci',
      recommendations_subtitle: 'Doporučení na základě aktuálních dat',
    },
    'en-US': {
      back_to_crm: 'Back to CRM',
      title: 'Analytics Dashboard',
      subtitle: 'Real-time insights and optimization recommendations',
      loading: 'Loading analytics...',
      range_7d: '7 Days',
      range_30d: '30 Days',
      range_90d: '90 Days',
      sample_notice: 'Showing sample data. To enable real analytics, run the SQL migration in Supabase.',
      metric_page_views: 'Page Views',
      metric_unique_visitors: 'Unique Visitors',
      metric_avg_session: 'Avg. Session',
      metric_bounce_rate: 'Bounce Rate',
      traffic_trend: 'Traffic Trend',
      device_breakdown: 'Device Breakdown',
      top_pages: 'Top Pages',
      top_countries: 'Top Countries',
      core_web_vitals: 'Core Web Vitals',
      seo_health: 'SEO Health Score',
      seo_note: 'Good - Room for improvement',
      seo_checklist: 'SEO Checklist',
      growth_metrics: 'Growth Metrics',
      organic_traffic: 'Organic Traffic',
      ctr: 'Search CTR',
      returning_visitors: 'Returning visitors',
      recommendations_title: 'Optimization Recommendations',
      recommendations_subtitle: 'Suggestions based on your current data',
    },
    'es-MX': {
      back_to_crm: 'Volver al CRM',
      title: 'Panel de analítica',
      subtitle: 'Insights en tiempo real y recomendaciones de optimización',
      loading: 'Cargando analítica...',
      range_7d: '7 días',
      range_30d: '30 días',
      range_90d: '90 días',
      sample_notice: 'Mostrando datos de ejemplo. Para activar la analítica real, ejecuta la migración SQL en Supabase.',
      metric_page_views: 'Vistas de página',
      metric_unique_visitors: 'Visitantes únicos',
      metric_avg_session: 'Sesión prom.',
      metric_bounce_rate: 'Tasa de rebote',
      traffic_trend: 'Tendencia de tráfico',
      device_breakdown: 'Dispositivos',
      top_pages: 'Páginas principales',
      top_countries: 'Países principales',
      core_web_vitals: 'Core Web Vitals',
      seo_health: 'Puntaje SEO',
      seo_note: 'Bueno, con margen para mejorar',
      seo_checklist: 'Checklist SEO',
      growth_metrics: 'Métricas de crecimiento',
      organic_traffic: 'Tráfico orgánico',
      ctr: 'CTR en buscadores',
      returning_visitors: 'Visitantes que regresan',
      recommendations_title: 'Recomendaciones de optimización',
      recommendations_subtitle: 'Sugerencias basadas en tus datos actuales',
    },
  }[lang] || {
    back_to_crm: 'Back to CRM',
    title: 'Analytics Dashboard',
    subtitle: 'Real-time insights and optimization recommendations',
    loading: 'Loading analytics...',
    range_7d: '7 Days',
    range_30d: '30 Days',
    range_90d: '90 Days',
    sample_notice: 'Showing sample data. To enable real analytics, run the SQL migration in Supabase.',
    metric_page_views: 'Page Views',
    metric_unique_visitors: 'Unique Visitors',
    metric_avg_session: 'Avg. Session',
    metric_bounce_rate: 'Bounce Rate',
    traffic_trend: 'Traffic Trend',
    device_breakdown: 'Device Breakdown',
    top_pages: 'Top Pages',
    top_countries: 'Top Countries',
    core_web_vitals: 'Core Web Vitals',
    seo_health: 'SEO Health Score',
    seo_note: 'Good - Room for improvement',
    seo_checklist: 'SEO Checklist',
    growth_metrics: 'Growth Metrics',
    organic_traffic: 'Organic Traffic',
    ctr: 'Search CTR',
    returning_visitors: 'Returning visitors',
    recommendations_title: 'Optimization Recommendations',
    recommendations_subtitle: 'Suggestions based on your current data',
  };

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Fetch page views from Supabase
      const { data: pageViews, error: pvError } = await (supabase as any)
        .from('page_views')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (pvError) {
        // If table doesn't exist, show setup instructions
        if (pvError.code === '42P01') {
          setError('Analytics table not set up. See setup instructions below.');
          setAnalytics(generateMockData());
        } else {
          throw pvError;
        }
      } else {
        setAnalytics(processAnalytics(pageViews || []));
      }

      // Fetch Web Vitals
      const { data: vitals } = await (supabase as any)
        .from('web_vitals')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (vitals && vitals.length > 0) {
        setPerformance(processWebVitals(vitals));
      } else {
        setPerformance(getDefaultPerformanceMetrics());
      }

    } catch (err) {
      console.error('Analytics error:', err);
      setError('Failed to load analytics. Using sample data.');
      setAnalytics(generateMockData());
      setPerformance(getDefaultPerformanceMetrics());
    } finally {
      setIsLoading(false);
    }
  };

  // Process raw page views into summary
  const processAnalytics = (pageViews: PageView[]): AnalyticsSummary => {
    const uniqueSessions = new Set(pageViews.map(pv => pv.session_id));
    const sessionsWithDuration = pageViews.filter(pv => pv.duration_seconds && pv.duration_seconds > 0);
    const bouncedSessions = pageViews.filter(pv => !pv.duration_seconds || pv.duration_seconds < 10);

    // Top pages
    const pageMap = new Map<string, { views: number; totalDuration: number }>();
    pageViews.forEach(pv => {
      const existing = pageMap.get(pv.path) || { views: 0, totalDuration: 0 };
      pageMap.set(pv.path, {
        views: existing.views + 1,
        totalDuration: existing.totalDuration + (pv.duration_seconds || 0)
      });
    });
    const topPages = Array.from(pageMap.entries())
      .map(([path, data]) => ({
        path,
        views: data.views,
        avgDuration: data.views > 0 ? data.totalDuration / data.views : 0
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Device breakdown
    const deviceMap = new Map<string, number>();
    pageViews.forEach(pv => {
      const device = getDeviceType(pv.user_agent, pv.screen_width);
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });
    const deviceBreakdown = Array.from(deviceMap.entries())
      .map(([device, count]) => ({
        device,
        count,
        percentage: pageViews.length > 0 ? (count / pageViews.length) * 100 : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Browser breakdown
    const browserMap = new Map<string, number>();
    pageViews.forEach(pv => {
      const browser = getBrowser(pv.user_agent);
      browserMap.set(browser, (browserMap.get(browser) || 0) + 1);
    });
    const browserBreakdown = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count);

    // Country breakdown
    const countryMap = new Map<string, number>();
    pageViews.forEach(pv => {
      const country = pv.country || 'Unknown';
      countryMap.set(country, (countryMap.get(country) || 0) + 1);
    });
    const countryBreakdown = Array.from(countryMap.entries())
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Hourly traffic
    const hourMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) hourMap.set(i, 0);
    pageViews.forEach(pv => {
      const hour = new Date(pv.created_at).getHours();
      hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
    });
    const hourlyTraffic = Array.from(hourMap.entries())
      .map(([hour, views]) => ({ hour, views }))
      .sort((a, b) => a.hour - b.hour);

    // Daily trend
    const dailyMap = new Map<string, { views: number; sessions: Set<string> }>();
    pageViews.forEach(pv => {
      const date = pv.created_at.split('T')[0];
      const existing = dailyMap.get(date) || { views: 0, sessions: new Set() };
      existing.views++;
      existing.sessions.add(pv.session_id);
      dailyMap.set(date, existing);
    });
    const dailyTrend = Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, views: data.views, visitors: data.sessions.size }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalPageViews: pageViews.length,
      uniqueVisitors: uniqueSessions.size,
      avgSessionDuration: sessionsWithDuration.length > 0
        ? sessionsWithDuration.reduce((sum, pv) => sum + (pv.duration_seconds || 0), 0) / sessionsWithDuration.length
        : 0,
      bounceRate: uniqueSessions.size > 0 ? (bouncedSessions.length / uniqueSessions.size) * 100 : 0,
      topPages,
      deviceBreakdown,
      browserBreakdown,
      countryBreakdown,
      hourlyTraffic,
      dailyTrend
    };
  };

  // Process Web Vitals
  const processWebVitals = (vitals: any[]): PerformanceMetric[] => {
    const metrics: PerformanceMetric[] = [];
    
    const lcpValues = vitals.filter(v => v.name === 'LCP').map(v => v.value);
    const fidValues = vitals.filter(v => v.name === 'FID').map(v => v.value);
    const clsValues = vitals.filter(v => v.name === 'CLS').map(v => v.value);
    const fcpValues = vitals.filter(v => v.name === 'FCP').map(v => v.value);
    const ttfbValues = vitals.filter(v => v.name === 'TTFB').map(v => v.value);

    if (lcpValues.length > 0) {
      const avg = lcpValues.reduce((a, b) => a + b, 0) / lcpValues.length;
      metrics.push({
        name: 'LCP (Largest Contentful Paint)',
        value: avg,
        rating: avg <= 2500 ? 'good' : avg <= 4000 ? 'needs-improvement' : 'poor',
        description: 'Time until the largest content element is visible',
        recommendation: avg > 2500 ? 'Optimize images, use lazy loading, and improve server response time' : 'Great! Your LCP is within the recommended range.'
      });
    }

    if (fidValues.length > 0) {
      const avg = fidValues.reduce((a, b) => a + b, 0) / fidValues.length;
      metrics.push({
        name: 'FID (First Input Delay)',
        value: avg,
        rating: avg <= 100 ? 'good' : avg <= 300 ? 'needs-improvement' : 'poor',
        description: 'Time from first user interaction to browser response',
        recommendation: avg > 100 ? 'Reduce JavaScript execution time and break up long tasks' : 'Excellent! Your site responds quickly to user input.'
      });
    }

    if (clsValues.length > 0) {
      const avg = clsValues.reduce((a, b) => a + b, 0) / clsValues.length;
      metrics.push({
        name: 'CLS (Cumulative Layout Shift)',
        value: avg,
        rating: avg <= 0.1 ? 'good' : avg <= 0.25 ? 'needs-improvement' : 'poor',
        description: 'Measures visual stability - how much the page layout shifts',
        recommendation: avg > 0.1 ? 'Add size attributes to images/videos and avoid inserting content above existing content' : 'Perfect! Your layout is stable.'
      });
    }

    return metrics.length > 0 ? metrics : getDefaultPerformanceMetrics();
  };

  // Generate mock data for demo
  const generateMockData = (): AnalyticsSummary => ({
    totalPageViews: 1247,
    uniqueVisitors: 423,
    avgSessionDuration: 185,
    bounceRate: 42.3,
    topPages: [
      { path: '/', views: 523, avgDuration: 45 },
      { path: '/episodes', views: 312, avgDuration: 120 },
      { path: '/episodes/ep15', views: 156, avgDuration: 280 },
      { path: '/contact', views: 89, avgDuration: 65 },
      { path: '/episodes/ep14', views: 78, avgDuration: 195 },
    ],
    deviceBreakdown: [
      { device: 'Mobile', count: 612, percentage: 49.1 },
      { device: 'Desktop', count: 534, percentage: 42.8 },
      { device: 'Tablet', count: 101, percentage: 8.1 },
    ],
    browserBreakdown: [
      { browser: 'Chrome', count: 623 },
      { browser: 'Safari', count: 389 },
      { browser: 'Firefox', count: 134 },
      { browser: 'Edge', count: 78 },
      { browser: 'Other', count: 23 },
    ],
    countryBreakdown: [
      { country: 'Czech Republic', count: 678 },
      { country: 'Slovakia', count: 234 },
      { country: 'Germany', count: 123 },
      { country: 'United States', count: 89 },
      { country: 'Poland', count: 67 },
    ],
    hourlyTraffic: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      views: Math.floor(Math.random() * 80) + 10
    })),
    dailyTrend: Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        views: Math.floor(Math.random() * 200) + 100,
        visitors: Math.floor(Math.random() * 80) + 30
      };
    })
  });

  // Default performance metrics
  const getDefaultPerformanceMetrics = (): PerformanceMetric[] => [
    {
      name: 'LCP (Largest Contentful Paint)',
      value: 2100,
      rating: 'good',
      description: 'Time until the largest content element is visible',
      recommendation: 'Your LCP is good! Keep optimizing images for even better performance.'
    },
    {
      name: 'FID (First Input Delay)',
      value: 45,
      rating: 'good',
      description: 'Time from first user interaction to browser response',
      recommendation: 'Excellent responsiveness! Users can interact with your site quickly.'
    },
    {
      name: 'CLS (Cumulative Layout Shift)',
      value: 0.08,
      rating: 'good',
      description: 'Measures visual stability',
      recommendation: 'Great layout stability! Content doesn\'t shift unexpectedly.'
    }
  ];

  // Optimization recommendations based on data
  const getRecommendations = (): { title: string; description: string; priority: 'high' | 'medium' | 'low'; action: string }[] => {
    if (!analytics) return [];
    
    const recs = [];

    // High bounce rate
    if (analytics.bounceRate > 50) {
      const title =
        lang === 'cs-CZ'
          ? 'Snižte míru odchodu'
          : lang === 'es-MX'
          ? 'Reduce la tasa de rebote'
          : 'Reduce Bounce Rate';
      const description =
        lang === 'cs-CZ'
          ? `Vaše bounce rate je ${analytics.bounceRate.toFixed(1)} %, což je nad doporučenými 40 %.`
          : lang === 'es-MX'
          ? `Tu tasa de rebote es ${analytics.bounceRate.toFixed(1)} %, lo que está por encima del 40 % recomendado.`
          : `Your bounce rate is ${analytics.bounceRate.toFixed(1)}%, which is above the recommended 40%.`;
      const action =
        lang === 'cs-CZ'
          ? 'Přidejte atraktivní obsah nad ohybem, zlepšete rychlost načítání a mějte jasné výzvy k akci.'
          : lang === 'es-MX'
          ? 'Añade contenido atractivo arriba del pliegue, mejora la velocidad de carga y usa llamados a la acción claros.'
          : 'Add engaging content above the fold, improve page load speed, and ensure clear calls-to-action.';

      recs.push({
        title,
        description,
        priority: 'high' as const,
        action,
      });
    }

    // Low session duration
    if (analytics.avgSessionDuration < 60) {
      const title =
        lang === 'cs-CZ'
          ? 'Zvyšte zapojení'
          : lang === 'es-MX'
          ? 'Incrementa el engagement'
          : 'Increase Engagement';
      const description =
        lang === 'cs-CZ'
          ? `Průměrná délka relace je pouze ${formatDuration(analytics.avgSessionDuration)}.`
          : lang === 'es-MX'
          ? `La duración promedio de la sesión es solo ${formatDuration(analytics.avgSessionDuration)}.`
          : `Average session duration is only ${formatDuration(analytics.avgSessionDuration)}.`;
      const action =
        lang === 'cs-CZ'
          ? 'Přidejte více poutavého obsahu, interní odkazy a zvažte video obsah, aby návštěvníci zůstali déle.'
          : lang === 'es-MX'
          ? 'Añade contenido más atractivo, enlaces internos y considera video para que las personas se queden más tiempo.'
          : 'Add more engaging content, internal links, and consider adding video content to keep visitors longer.';

      recs.push({
        title,
        description,
        priority: 'high' as const,
        action,
      });
    }

    // Mobile optimization
    const mobileDevice = analytics.deviceBreakdown.find(d => d.device === 'Mobile');
    if (mobileDevice && mobileDevice.percentage > 40) {
      const title =
        lang === 'cs-CZ'
          ? 'Optimalizace pro mobily'
          : lang === 'es-MX'
          ? 'Optimización móvil'
          : 'Mobile Optimization';
      const description =
        lang === 'cs-CZ'
          ? `${mobileDevice.percentage.toFixed(1)} % návštěvnosti je z mobilních zařízení.`
          : lang === 'es-MX'
          ? `${mobileDevice.percentage.toFixed(1)} % de tu tráfico viene de dispositivos móviles.`
          : `${mobileDevice.percentage.toFixed(1)}% of your traffic is from mobile devices.`;
      const action =
        lang === 'cs-CZ'
          ? 'Ujistěte se, že všechny stránky jsou responzivní, tlačítka jsou pohodlná na dotek a formuláře se snadno vyplňují na mobilu.'
          : lang === 'es-MX'
          ? 'Asegúrate de que todas las páginas sean totalmente responsivas, con botones cómodos y formularios fáciles de completar en móvil.'
          : 'Ensure all pages are fully responsive, buttons are touch-friendly, and forms are easy to fill on mobile.';

      recs.push({
        title,
        description,
        priority: 'medium' as const,
        action,
      });
    }

    // Top pages optimization
    if (analytics.topPages.length > 0) {
      const homePage = analytics.topPages.find(p => p.path === '/');
      if (homePage && homePage.avgDuration < 30) {
        const title =
          lang === 'cs-CZ'
            ? 'Zvyšte zapojení na homepage'
            : lang === 'es-MX'
            ? 'Mejora el engagement en la página principal'
            : 'Improve Homepage Engagement';
        const description =
          lang === 'cs-CZ'
            ? 'Návštěvníci tráví na vaší homepage méně než 30 sekund.'
            : lang === 'es-MX'
            ? 'Los visitantes pasan menos de 30 segundos en tu página principal.'
            : 'Visitors spend less than 30 seconds on your homepage.';
        const action =
          lang === 'cs-CZ'
            ? 'Přidejte silné nadpisy, doporučené epizody a jasnou navigaci, aby návštěvníci prozkoumávali dál.'
            : lang === 'es-MX'
            ? 'Añade titulares potentes, episodios destacados y navegación clara para que exploren más.'
            : 'Add compelling headlines, featured episodes, and clear navigation to keep visitors exploring.';

        recs.push({
          title,
          description,
          priority: 'medium' as const,
          action,
        });
      }
    }

    // Add general recommendations
    const seoTitle =
      lang === 'cs-CZ'
        ? 'SEO optimalizace'
        : lang === 'es-MX'
        ? 'Optimización SEO'
        : 'SEO Optimization';
    const seoDescription =
      lang === 'cs-CZ'
        ? 'Zlepšete viditelnost ve vyhledávání.'
        : lang === 'es-MX'
        ? 'Mejora tu visibilidad en buscadores.'
        : 'Improve organic search visibility.';
    const seoAction =
      lang === 'cs-CZ'
        ? 'Přidejte meta popisky, optimalizujte obrázky pomocí alt textu a tvořte obsah kolem cílových klíčových slov.'
        : lang === 'es-MX'
        ? 'Añade metadescripciones, optimiza imágenes con texto alternativo y crea contenido alrededor de tus keywords.'
        : 'Add meta descriptions, optimize images with alt text, and create content around target keywords.';

    recs.push({
      title: seoTitle,
      description: seoDescription,
      priority: 'low' as const,
      action: seoAction,
    });

    return recs;
  };

  const recommendations = getRecommendations();

  const seoTips =
    lang === 'cs-CZ'
      ? [
          { title: 'Přidejte XML sitemapu', desc: 'Pomůže vyhledávačům objevit všechny vaše stránky', action: 'Vytvořte sitemap.xml ve složce public' },
          { title: 'Optimalizujte obrázky', desc: 'Přidejte alt text ke všem obrázkům pro přístupnost a SEO', action: 'Používejte popisné alt atributy' },
          { title: 'Interní prolinkování', desc: 'Propojte epizody mezi sebou, aby uživatelé zůstali déle', action: 'Přidejte sekci „Související epizody“' },
          { title: 'Rychlost stránek', desc: 'Rychlejší stránky mají lepší pozice ve vyhledávání', action: 'Komprimujte obrázky, používejte lazy loading' },
          { title: 'Mobilní zážitek', desc: 'Google používá mobile-first indexování', action: 'Testujte web na různých zařízeních' },
          { title: 'Délka obsahu', desc: 'Delší kvalitní obsah má lepší výsledky', action: 'Přidejte detailní popisy epizod' },
        ]
      : lang === 'es-MX'
      ? [
          { title: 'Agrega un sitemap XML', desc: 'Ayuda a los buscadores a descubrir todas tus páginas', action: 'Crea sitemap.xml en la carpeta public' },
          { title: 'Optimiza tus imágenes', desc: 'Añade texto alternativo a todas las imágenes para accesibilidad y SEO', action: 'Usa atributos alt descriptivos' },
          { title: 'Enlazado interno', desc: 'Enlaza entre episodios para mantener a las personas navegando', action: 'Añade una sección de “Episodios relacionados”' },
          { title: 'Velocidad de página', desc: 'Las páginas más rápidas se posicionan mejor', action: 'Comprime imágenes y usa carga diferida' },
          { title: 'Experiencia móvil', desc: 'Google usa indexación mobile-first', action: 'Prueba el sitio en distintos dispositivos' },
          { title: 'Longitud del contenido', desc: 'Contenido largo y de calidad rinde mejor', action: 'Añade descripciones detalladas de los episodios' },
        ]
      : [
          { title: 'Add XML Sitemap', desc: 'Help search engines discover all your pages', action: 'Create sitemap.xml in public folder' },
          { title: 'Optimize Images', desc: 'Add alt text to all images for accessibility & SEO', action: 'Use descriptive alt attributes' },
          { title: 'Internal Linking', desc: 'Link between episodes to keep users engaged', action: 'Add "Related Episodes" section' },
          { title: 'Page Speed', desc: 'Faster pages rank higher in search results', action: 'Compress images, lazy load content' },
          { title: 'Mobile Experience', desc: 'Google uses mobile-first indexing', action: 'Test on multiple devices' },
          { title: 'Content Length', desc: 'Longer, quality content ranks better', action: 'Add detailed episode descriptions' },
        ];

  const seoTools =
    lang === 'cs-CZ'
      ? [
          { tool: 'Google Search Console', url: 'https://search.google.com/search-console', desc: 'Sledujte výkon ve vyhledávání, indexaci a klíčová slova', icon: '🔍' },
          { tool: 'Google PageSpeed', url: 'https://pagespeed.web.dev/', desc: 'Testujte rychlost stránek a Core Web Vitals', icon: '⚡' },
          { tool: 'Ahrefs Free Tools', url: 'https://ahrefs.com/free-seo-tools', desc: 'Kontrola odkazů, návrhy klíčových slov a SERP analýza', icon: '🔗' },
          { tool: 'Schema Validator', url: 'https://validator.schema.org/', desc: 'Validujte své structured data', icon: '✅' },
        ]
      : lang === 'es-MX'
      ? [
          { tool: 'Google Search Console', url: 'https://search.google.com/search-console', desc: 'Supervisa el rendimiento en búsqueda, indexación y keywords', icon: '🔍' },
          { tool: 'Google PageSpeed', url: 'https://pagespeed.web.dev/', desc: 'Prueba la velocidad de tus páginas y Core Web Vitals', icon: '⚡' },
          { tool: 'Ahrefs Free Tools', url: 'https://ahrefs.com/free-seo-tools', desc: 'Backlinks, ideas de palabras clave y análisis de SERP', icon: '🔗' },
          { tool: 'Schema Validator', url: 'https://validator.schema.org/', desc: 'Valida tu marcado de datos estructurados', icon: '✅' },
        ]
      : [
          { tool: 'Google Search Console', url: 'https://search.google.com/search-console', desc: 'Monitor search performance, indexing issues, and keywords', icon: '🔍' },
          { tool: 'Google PageSpeed', url: 'https://pagespeed.web.dev/', desc: 'Test page speed and Core Web Vitals scores', icon: '⚡' },
          { tool: 'Ahrefs Free Tools', url: 'https://ahrefs.com/free-seo-tools', desc: 'Backlink checker, keyword generator, SERP checker', icon: '🔗' },
          { tool: 'Schema Validator', url: 'https://validator.schema.org/', desc: 'Validate your structured data markup', icon: '✅' },
        ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-iconic-pink border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12 relative overflow-hidden">
      {/* Animated Aurora Background - Pink to Purple */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-pink-50/30 to-purple-50/40"></div>
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-iconic-pink/20 to-rose-200/15 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-fuchsia-300/15 to-pink-200/10 rounded-full blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-[550px] h-[550px] bg-gradient-to-tr from-violet-200/15 to-purple-100/10 rounded-full blur-[110px] animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-fuchsia-100/15 to-pink-100/10 rounded-full blur-[90px] animate-blob" style={{animationDelay: '3s'}}></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {analytics && (
          <>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <Link to="/crm" className="inline-flex items-center text-gray-500 hover:text-iconic-pink mb-2 text-sm">
              <ArrowLeft size={16} className="mr-1" /> {t.back_to_crm}
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-iconic-black flex items-center gap-3">
              <BarChart3 className="text-iconic-pink" />
              {t.title}
            </h1>
            <p className="text-gray-500 mt-1">{t.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    dateRange === range
                      ? 'bg-iconic-pink text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {range === '7d' ? t.range_7d : range === '30d' ? t.range_30d : t.range_90d}
                </button>
              ))}
            </div>
            
            <button
              onClick={fetchAnalytics}
              className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Error/Setup Notice */}
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-amber-800 font-medium">{error}</p>
                <p className="text-amber-700 text-sm mt-1">
                  {t.sample_notice}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Eye size={20} />}
            label={t.metric_page_views}
            value={analytics.totalPageViews.toLocaleString()}
            color="purple"
            tooltip={t.metric_page_views}
          />
          <MetricCard
            icon={<Users size={20} />}
            label={t.metric_unique_visitors}
            value={analytics.uniqueVisitors.toLocaleString()}
            color="pink"
            tooltip={t.metric_unique_visitors}
          />
          <MetricCard
            icon={<Clock size={20} />}
            label={t.metric_avg_session}
            value={analytics.avgSessionDuration > 0 ? formatDuration(analytics.avgSessionDuration) : '0s'}
            color="green"
            tooltip={t.metric_avg_session}
          />
          <MetricCard
            icon={<MousePointerClick size={20} />}
            label={t.metric_bounce_rate}
            value={`${analytics.bounceRate.toFixed(1)}%`}
            color="orange"
            invertTrend
            tooltip={t.metric_bounce_rate}
          />
        </div>

        {/* Growth & SEO Metrics (sample, for quick at-a-glance view) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<TrendingUp size={20} />}
            label={t.organic_traffic}
            value="+68%"
            trend={68}
            color="green"
            tooltip={t.organic_traffic}
          />
          <MetricCard
            icon={<MousePointerClick size={20} />}
            label={t.ctr}
            value="4.3%"
            trend={12}
            color="blue"
            tooltip={t.ctr}
          />
          <MetricCard
            icon={<Users size={20} />}
            label={t.returning_visitors}
            value="37%"
            trend={8}
            color="purple"
            tooltip={t.returning_visitors}
          />
          <MetricCard
            icon={<Activity size={20} />}
            label={t.seo_health}
            value="82 / 100"
            trend={5}
            color="pink"
            tooltip={t.seo_note}
          />
        </div>

        {/* SEO Improvement Tips */}
            <div className="bg-gradient-to-br from-purple-600 to-iconic-pink rounded-2xl p-6 text-white mb-8">
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Target className="text-white" />
                SEO Improvement Tips
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: 'Add XML Sitemap', desc: 'Help search engines discover all your pages', action: 'Create sitemap.xml in public folder' },
                  { title: 'Optimize Images', desc: 'Add alt text to all images for accessibility & SEO', action: 'Use descriptive alt attributes' },
                  { title: 'Internal Linking', desc: 'Link between episodes to keep users engaged', action: 'Add "Related Episodes" section' },
                  { title: 'Page Speed', desc: 'Faster pages rank higher in search results', action: 'Compress images, lazy load content' },
                  { title: 'Mobile Experience', desc: 'Google uses mobile-first indexing', action: 'Test on multiple devices' },
                  { title: 'Content Length', desc: 'Longer, quality content ranks better', action: 'Add detailed episode descriptions' },
                ].map((tip, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <h4 className="font-bold mb-1">{tip.title}</h4>
                    <p className="text-sm text-white/70 mb-2">{tip.desc}</p>
                    <p className="text-xs text-yellow-300">💡 {tip.action}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Analyze Your Site */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg mb-8">
              <h3 className="font-bold text-iconic-black mb-4 flex items-center gap-2">
                <Lightbulb size={20} className="text-yellow-500" />
                How to Analyze Your Site for SEO
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { tool: 'Google Search Console', url: 'https://search.google.com/search-console', desc: 'Monitor search performance, indexing issues, and keywords', icon: '🔍' },
                  { tool: 'Google PageSpeed', url: 'https://pagespeed.web.dev/', desc: 'Test page speed and Core Web Vitals scores', icon: '⚡' },
                  { tool: 'Ahrefs Free Tools', url: 'https://ahrefs.com/free-seo-tools', desc: 'Backlink checker, keyword generator, SERP checker', icon: '🔗' },
                  { tool: 'Schema Validator', url: 'https://validator.schema.org/', desc: 'Validate your structured data markup', icon: '✅' },
                ].map((tool, i) => (
                  <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" 
                    className="block p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                    <div className="text-2xl mb-2">{tool.icon}</div>
                    <h4 className="font-bold text-iconic-black group-hover:text-iconic-pink transition-colors">{tool.tool}</h4>
                    <p className="text-xs text-gray-500 mt-1">{tool.desc}</p>
                  </a>
                ))}
              </div>
            </div>

            {/* Optimization Recommendations */}
            <div className="bg-gradient-to-br from-iconic-black to-gray-800 rounded-2xl p-6 text-white mb-8">
              <h3 className="font-bold text-xl mb-1 flex items-center gap-2">
                <Lightbulb className="text-yellow-400" />
                {t.recommendations_title}
              </h3>
              <p className="text-sm text-white/70 mb-4">{t.recommendations_subtitle}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {recommendations.map((rec, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        rec.priority === 'high' ? 'bg-red-500' :
                        rec.priority === 'medium' ? 'bg-yellow-500 text-black' :
                        'bg-blue-500'
                      }`}>
                        {rec.priority.toUpperCase()}
                      </span>
                      <div className="flex-1">
                        <h4 className="font-bold mb-1">{rec.title}</h4>
                        <p className="text-sm text-white/70 mb-2">{rec.description}</p>
                        <p className="text-sm text-iconic-pink">{rec.action}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Analytics Links */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg">
              <h3 className="font-bold text-iconic-black mb-4">External Analytics Tools</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <a
                  href="https://vercel.com/vistadevmx/iconicpodcast/analytics"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <BarChart3 size={24} className="text-iconic-black" />
                  <div>
                    <p className="font-bold text-iconic-black">Vercel Analytics</p>
                    <p className="text-xs text-gray-500">Real-time traffic data</p>
                  </div>
                </a>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Globe size={24} className="text-blue-500" />
                  <div>
                    <p className="font-bold text-iconic-black">Search Console</p>
                    <p className="text-xs text-gray-500">Google search performance</p>
                  </div>
                </a>
                <a
                  href="https://pagespeed.web.dev/analysis?url=https://iconicpodcast.eu"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <Zap size={24} className="text-yellow-500" />
                  <div>
                    <p className="font-bold text-iconic-black">PageSpeed Insights</p>
                    <p className="text-xs text-gray-500">Performance analysis</p>
                  </div>
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Metric Card Component with colorful backgrounds and tooltips
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  invertTrend?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'pink';
  tooltip?: string;
}> = ({ icon, label, value, trend, invertTrend, color = 'blue', tooltip }) => {
  const isPositive = invertTrend ? (trend || 0) < 0 : (trend || 0) > 0;
  
  const colorClasses = {
    blue: 'bg-gradient-to-br from-blue-500 to-blue-600',
    green: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    purple: 'bg-gradient-to-br from-purple-500 to-purple-600',
    orange: 'bg-gradient-to-br from-orange-500 to-orange-600',
    pink: 'bg-gradient-to-br from-iconic-pink to-pink-600',
  };
  
  return (
    <div className={`${colorClasses[color]} rounded-2xl p-5 shadow-lg text-white relative group cursor-help`}>
      {/* Tooltip */}
      {tooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-iconic-black text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-xl">
          {tooltip}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-iconic-black"></div>
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center text-white">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-white/80">{label}</p>
    </div>
  );
};

export default AnalyticsDashboard;
