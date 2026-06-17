// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// التخطيط الرئيسي للتطبيق - Root Layout
// يحتوي على: الخلفيات التكنولوجية المتحركة، إعدادات الأمان،
// المزودات العامة، تحميل الخطوط، مانع النسخ والتصوير
// آخر تحديث: 2026-06-18
// ============================================================

import type { Metadata, Viewport } from 'next';
import { Tajawal, Cairo, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { Suspense } from 'react';
import Script from 'next/script';

// ----------------------------------------------------------
// المكونات الأساسية
// ----------------------------------------------------------
import { AuthProvider } from '@/lib/auth/AuthContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { SecurityProvider } from '@/components/providers/SecurityProvider';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { TechBackground } from '@/components/ui/TechBackground';
import { CircuitLines } from '@/components/ui/CircuitLines';
import { DigitalParticles } from '@/components/ui/DigitalParticles';
import { AntiPiracyWrapper } from '@/lib/security/AntiPiracy';
import { WatermarkEngine } from '@/lib/security/WatermarkEngine';
import { DeviceFingerprint } from '@/lib/security/DeviceFingerprint';

// ----------------------------------------------------------
// الأنماط العامة
// ----------------------------------------------------------
import '@/styles/globals.css';
import '@/styles/tech-theme.css';
import '@/styles/animations.css';
import '@/styles/security.css';

// ============================================================
// تحميل الخطوط
// ============================================================
const fontArabic = Tajawal({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  display: 'swap',
  variable: '--font-arabic',
  preload: true,
  fallback: ['Cairo', 'Almarai', 'sans-serif'],
  adjustFontFallback: true,
});

const fontCairo = Cairo({
  subsets: ['arabic'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
  preload: true,
  fallback: ['Tajawal', 'sans-serif'],
  adjustFontFallback: true,
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-mono',
  preload: true,
  fallback: ['Fira Code', 'Consolas', 'monospace'],
  adjustFontFallback: true,
});

// ============================================================
// البيانات الوصفية (Metadata) - SEO وأمان
// ============================================================
export const metadata: Metadata = {
  // العنوان والوصف
  title: {
    default: 'نقابة تكنولوجيا المعلومات والبرمجيات - ITWS',
    template: '%s | ITWS - نقابة تكنولوجيا المعلومات والبرمجيات',
  },
  description:
    'النظام المتكامل لإدارة العضويات بنقابة تكنولوجيا المعلومات والبرمجيات. نظام ذكي لاستقبال الطلبات، التعرف على البطاقات، إدارة الفروع واللجان المهنية، والأختام الرقمية المؤمنة.',
  
  // الكلمات المفتاحية
  keywords: [
    'نقابة تكنولوجيا المعلومات',
    'نقابة البرمجيات',
    'ITWS',
    'عضوية نقابة',
    'تكنولوجيا المعلومات',
    'هندسة برمجيات',
    'أمن سيبراني',
    'ذكاء اصطناعي',
    'مصر',
    'نقابة المبرمجين',
    'Information Technology Syndicate',
    'Egypt IT Syndicate',
  ],
  
  // المؤلف والحقوق
  authors: [{ name: 'نقابة تكنولوجيا المعلومات والبرمجيات - ITWS', url: 'https://itws-syndicate.vercel.app' }],
  creator: 'ITWS - نقابة تكنولوجيا المعلومات والبرمجيات',
  publisher: 'ITWS - نقابة تكنولوجيا المعلومات والبرمجيات',
  
  // الروبوتات والفهرسة
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
  
  // الأيقونات
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-icon-180.png', type: 'image/png', sizes: '180x180' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#0066FF',
      },
    ],
  },
  
  // البيان
  manifest: '/manifest.json',
  
  // بيانات Open Graph
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: 'en_US',
    url: 'https://itws-syndicate.vercel.app',
    siteName: 'نقابة تكنولوجيا المعلومات والبرمجيات - ITWS',
    title: 'نقابة تكنولوجيا المعلومات والبرمجيات - ITWS',
    description: 'النظام المتكامل لإدارة العضويات بنقابة تكنولوجيا المعلومات والبرمجيات',
    images: [
      {
        url: 'https://res.cloudinary.com/itwmembers/image/upload/v1/itwsmembers/syndicate/og-image',
        width: 1200,
        height: 630,
        alt: 'شعار نقابة تكنولوجيا المعلومات والبرمجيات',
      },
    ],
    countryName: 'Egypt',
    emails: ['contact@itws-syndicate.org'],
    phoneNumbers: ['+20XXXXXXXXXXX'],
  },
  
  // بيانات Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'نقابة تكنولوجيا المعلومات والبرمجيات - ITWS',
    description: 'النظام المتكامل لإدارة العضويات بنقابة تكنولوجيا المعلومات والبرمجيات',
    images: ['https://res.cloudinary.com/itwmembers/image/upload/v1/itwsmembers/syndicate/og-image'],
    creator: '@ITWS_Egypt',
    site: '@ITWS_Egypt',
  },
  
  // تنسيق الكشف
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // بيانات التطبيق
  applicationName: 'ITWS Members System',
  generator: 'Next.js',
  referrer: 'strict-origin-when-cross-origin',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
    { media: '(prefers-color-scheme: light)', color: '#0F172A' },
  ],
  colorScheme: 'dark only',
  
  // التصنيف
  category: 'business',
  classification: 'Private',
  
  // منع الأرشفة
  archives: [],
  assets: [],
  
  // البيانات الوصفية الإضافية
  metadataBase: new URL('https://itws-syndicate.vercel.app'),
  alternates: {
    canonical: 'https://itws-syndicate.vercel.app',
    languages: {
      'ar-EG': 'https://itws-syndicate.vercel.app/ar',
      'en-US': 'https://itws-syndicate.vercel.app/en',
    },
  },
};

// ============================================================
// إعدادات منفذ العرض (Viewport)
// ============================================================
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
    { media: '(prefers-color-scheme: light)', color: '#0F172A' },
  ],
  colorScheme: 'dark only',
};

// ============================================================
// المكون الرئيسي - RootLayout
// ============================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`dark ${fontArabic.variable} ${fontCairo.variable} ${fontMono.variable}`}
      suppressHydrationWarning
      data-theme="cyber-dark"
      data-app="ITWS-Members-System"
      data-version="1.0.0"
    >
      <head>
        {/* ================================================== */}
        {/* العلامات الوصفية الأساسية */}
        {/* ================================================== */}
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        
        {/* ================================================== */}
        {/* منع التخزين المؤقت للمتصفح */}
        {/* ================================================== */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate, private" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* ================================================== */}
        {/* أمان إضافي */}
        {/* ================================================== */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="ITWS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#020617" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* ================================================== */}
        {/* منع التخمين والتصيد */}
        {/* ================================================== */}
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        <meta name="crossorigin" content="anonymous" />
        
        {/* ================================================== */}
        {/* تلميحات الموارد */}
        {/* ================================================== */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firestore.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://identitytoolkit.googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://firestore.googleapis.com" />
        
        {/* ================================================== */}
        {/* منع Clickjacking عبر CSP Meta (احتياطي) */}
        {/* ================================================== */}
        <meta httpEquiv="Content-Security-Policy" content="frame-ancestors 'none';" />
      </head>
      
      <body
        className={`
          ${fontArabic.variable}
          ${fontCairo.variable}
          ${fontMono.variable}
          font-arabic
          antialiased
          text-neutral-100
          bg-neutral-950
          selection:bg-cyber-blue/30
          selection:text-white
          overflow-x-hidden
          min-h-screen
          relative
        `}
        data-scroll-container
        data-security-level="maximum"
      >
        {/* ================================================== */}
        {/* مزودات السياق (Context Providers) */}
        {/* ================================================== */}
        <ThemeProvider>
          <AuthProvider>
            <SecurityProvider>
              <AntiPiracyWrapper>
                <WatermarkEngine>
                  <DeviceFingerprint>
                    
                    {/* ====================================== */}
                    {/* منطقة التحميل المعلق (Suspense) */}
                    {/* ====================================== */}
                    <Suspense fallback={<LoadingScreen type="fullscreen" message="جاري تحميل النظام..." />}>
                      
                      {/* ================================== */}
                      {/* الخلفية التكنولوجية المتحركة */}
                      {/* ================================== */}
                      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
                        {/* خلفية تكنولوجية داكنة */}
                        <TechBackground
                          variant="cyber-grid"
                          opacity={0.15}
                          animated={true}
                          speed={0.5}
                        />
                        
                        {/* دوائر إلكترونية متحركة */}
                        <CircuitLines
                          density="medium"
                          color="cyber-blue"
                          animated={true}
                          speed={3}
                          opacity={0.1}
                        />
                        
                        {/* جسيمات رقمية */}
                        <DigitalParticles
                          count={50}
                          colors={['#00F0FF', '#B800FF', '#FF00E5', '#00FF88']}
                          speed="slow"
                          size="small"
                        />
                        
                        {/* طبقة تأثير زجاجي */}
                        <div
                          className="absolute inset-0 backdrop-blur-[100px] opacity-30"
                          style={{
                            background: 'radial-gradient(ellipse at 50% 0%, rgba(0,240,255,0.05) 0%, transparent 50%), radial-gradient(ellipse at 80% 100%, rgba(184,0,255,0.03) 0%, transparent 50%), radial-gradient(ellipse at 20% 50%, rgba(0,255,136,0.02) 0%, transparent 50%)',
                          }}
                        />
                        
                        {/* خطوط المسح */}
                        <div
                          className="absolute inset-0 opacity-5"
                          style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,240,255,0.03) 0px, rgba(0,240,255,0.03) 1px, transparent 1px, transparent 2px)',
                            backgroundSize: '100% 2px',
                            animation: 'scanLine 8s linear infinite',
                          }}
                        />
                      </div>
                      
                      {/* ================================== */}
                      {/* المحتوى الرئيسي */}
                      {/* ================================== */}
                      <main
                        className="relative z-10 min-h-screen"
                        id="main-content"
                        data-protected="true"
                      >
                        {children}
                      </main>
                      
                    </Suspense>
                    
                  </DeviceFingerprint>
                </WatermarkEngine>
              </AntiPiracyWrapper>
            </SecurityProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* ================================================== */}
        {/* نظام الإشعارات (Toast) */}
        {/* ================================================== */}
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={16}
          containerClassName="font-arabic"
          toastOptions={{
            duration: 5000,
            style: {
              background: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              color: '#E2E8F0',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              borderRadius: '12px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: '500',
              boxShadow: '0 0 20px rgba(0, 240, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: {
                primary: '#00FF88',
                secondary: '#0F172A',
              },
              style: {
                border: '1px solid rgba(0, 255, 136, 0.3)',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF0044',
                secondary: '#0F172A',
              },
              style: {
                border: '1px solid rgba(255, 0, 68, 0.3)',
                boxShadow: '0 0 20px rgba(255, 0, 68, 0.15), 0 8px 32px rgba(0, 0, 0, 0.4)',
              },
            },
          }}
        />
        
        {/* ================================================== */}
        {/* سكريبتات الأمان (تعمل بعد تحميل الصفحة) */}
        {/* ================================================== */}
        <Script
          id="security-scripts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              // ==========================================
              // 🛡️ ITWS Security Scripts
              // ==========================================
              
              (function() {
                'use strict';
                
                // ------------------------------------------
                // 1. منع قائمة السياق (زر الفأرة الأيمن)
                // ------------------------------------------
                document.addEventListener('contextmenu', function(e) {
                  e.preventDefault();
                  return false;
                });
                
                // ------------------------------------------
                // 2. منع اختصارات لوحة المفاتيح للتطوير
                // ------------------------------------------
                document.addEventListener('keydown', function(e) {
                  // F12
                  if (e.key === 'F12' || e.keyCode === 123) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+Shift+I (DevTools)
                  if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+Shift+J (Console)
                  if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+Shift+C (Element Inspector)
                  if (e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+U (View Source)
                  if (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+S (Save Page)
                  if (e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+P (Print - we handle printing through our system)
                  if (e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80)) {
                    e.preventDefault();
                    return false;
                  }
                  
                  // Ctrl+Shift+Delete
                  if (e.ctrlKey && e.shiftKey && (e.key === 'Delete' || e.keyCode === 46)) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // ------------------------------------------
                // 3. كشف DevTools
                // ------------------------------------------
                let devToolsOpen = false;
                
                const detectDevTools = function() {
                  const threshold = 160;
                  const widthThreshold = window.outerWidth - window.innerWidth > threshold;
                  const heightThreshold = window.outerHeight - window.innerHeight > threshold;
                  
                  if (widthThreshold || heightThreshold) {
                    if (!devToolsOpen) {
                      devToolsOpen = true;
                      console.clear();
                      console.log('%c⚠️ تحذير أمني', 'color: red; font-size: 30px; font-weight: bold;');
                      console.log('%cأدوات المطور ممنوعة في هذا النظام', 'color: orange; font-size: 20px;');
                      console.log('%cجميع الأنشطة مسجلة ومراقبة', 'color: yellow; font-size: 16px;');
                    }
                  } else {
                    devToolsOpen = false;
                  }
                };
                
                setInterval(detectDevTools, 1000);
                
                // ------------------------------------------
                // 4. منع الطباعة غير المصرح بها
                // ------------------------------------------
                window.addEventListener('beforeprint', function(e) {
                  if (!window.ITWS_PRINT_AUTHORIZED) {
                    e.preventDefault();
                    window.alert('الطباعة متاحة فقط من خلال نظام النقابة');
                    return false;
                  }
                });
                
                // ------------------------------------------
                // 5. منع السحب والإفلات (حماية الصور)
                // ------------------------------------------
                document.addEventListener('dragstart', function(e) {
                  if (e.target.tagName === 'IMG' || e.target.style.backgroundImage) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // ------------------------------------------
                // 6. منع تحديد النص (للعناصر المحمية)
                // ------------------------------------------
                document.addEventListener('selectstart', function(e) {
                  if (e.target.closest('[data-protected="true"]') || 
                      e.target.closest('[data-no-select="true"]')) {
                    e.preventDefault();
                    return false;
                  }
                });
                
                // ------------------------------------------
                // 7. تنظيف الكونسول
                // ------------------------------------------
                console.clear();
                console.log('%c🏛️ نقابة تكنولوجيا المعلومات والبرمجيات - ITWS', 'color: #00F0FF; font-size: 16px; font-weight: bold;');
                console.log('%c⚠️ هذه أدوات مخصصة للمطورين المعتمدين فقط', 'color: #FFA500;');
                console.log('%cجميع الأنشطة مسجلة ومراقبة لأغراض الأمان', 'color: #FF0044;');
                
                // ------------------------------------------
                // 8. تجاوز دوال الكونسول لمنع التسريب
                // ------------------------------------------
                const noop = function() {};
                const originalConsole = { ...console };
                
                // السماح فقط بأنواع معينة من السجلات
                console.log = function(...args) {
                  if (window.ITWS_DEBUG_MODE) {
                    originalConsole.log.apply(console, args);
                  }
                };
                console.warn = function(...args) {
                  if (window.ITWS_DEBUG_MODE) {
                    originalConsole.warn.apply(console, args);
                  }
                };
                console.error = originalConsole.error; // نحتفظ بالأخطاء
                console.info = noop;
                console.debug = noop;
                console.trace = noop;
                console.dir = noop;
                console.dirxml = noop;
                console.profile = noop;
                console.profileEnd = noop;
                console.time = noop;
                console.timeEnd = noop;
                console.timeStamp = noop;
                console.group = noop;
                console.groupEnd = noop;
                console.groupCollapsed = noop;
                console.table = noop;
                console.count = noop;
                console.countReset = noop;
                console.assert = noop;
                
                // ------------------------------------------
                // 9. علامة مائية على جميع الصور
                // ------------------------------------------
                const addWatermarkToImages = function() {
                  document.querySelectorAll('img[data-watermark="true"]').forEach(function(img) {
                    if (!img.dataset.watermarked) {
                      img.style.position = 'relative';
                      img.dataset.watermarked = 'true';
                    }
                  });
                };
                
                const observer = new MutationObserver(addWatermarkToImages);
                observer.observe(document.body, { childList: true, subtree: true });
                
                // ------------------------------------------
                // 10. حماية من التصوير عبر WebRTC Screen Sharing
                // ------------------------------------------
                if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
                  const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
                  navigator.mediaDevices.getDisplayMedia = function() {
                    console.clear();
                    return Promise.reject(new Error('مشاركة الشاشة غير مسموحة في هذا النظام'));
                  };
                }
                
                // ------------------------------------------
                // 11. إعداد متغيرات عامة
                // ------------------------------------------
                window.ITWS_APP_NAME = 'نقابة تكنولوجيا المعلومات والبرمجيات';
                window.ITWS_APP_VERSION = '1.0.0';
                window.ITWS_BUILD_TIME = '${new Date().toISOString()}';
                window.ITWS_DEBUG_MODE = false;
                window.ITWS_PRINT_AUTHORIZED = false;
                
                console.log('%c✅ نظام الحماية جاهز', 'color: #00FF88; font-weight: bold;');
                
              })();
            `,
          }}
        />
        
        {/* ================================================== */}
        {/* Google Analytics (اختياري - للإحصائيات) */}
        {/* ================================================== */}
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}', {
                  page_path: window.location.pathname,
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=Strict;Secure',
                });
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}

// ============================================================
// تكوينات إضافية
// ============================================================

// إجبار الصفحة على أن تكون ديناميكية (غير ثابتة)
export const dynamic = 'force-dynamic';

// إعادة التحقق كل ساعة كحد أقصى
export const revalidate = 3600;

// وقت التشغيل
export const runtime = 'nodejs';
