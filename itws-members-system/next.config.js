/** @type {import('next').NextConfig} */

// ============================================================
// 🏛️ نقابة تكنولوجيا المعلومات والبرمجيات - ITWS
// إعدادات Next.js - الإصدار 14.2.21
// آخر تحديث: 2026-06-18
// ============================================================

const withBundleAnalyzer = process.env.ANALYZE === 'true' 
  ? require('@next/bundle-analyzer')() 
  : (config) => config;

// قائمة النطاقات المسموح بها للصور
const imageDomains = [
  'res.cloudinary.com',
  'itws-members-systems.firebasestorage.app',
  'firebasestorage.googleapis.com',
  'lh3.googleusercontent.com',
  'graph.facebook.com',
];

// قائمة النطاقات المسموح بها للاتصالات الخارجية
const allowedOrigins = [
  'https://itws-members-systems.web.app',
  'https://itws-members-systems.firebaseapp.com',
  'https://itws-syndicate.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
];

// تكوينات الأمان المتقدمة
const securityHeaders = [
  // ----------------------------------------------------------
  // سياسة أمان المحتوى - Content Security Policy (CSP)
  // تمنع تنفيذ أي كود غير مصرح به
  // ----------------------------------------------------------
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // السماح بتحميل الخطوط
      "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com",
      // السماح بالصور
      "img-src 'self' data: blob: https://res.cloudinary.com https://*.cloudinary.com https://firebasestorage.googleapis.com https://*.firebasestorage.googleapis.com https://lh3.googleusercontent.com",
      // السماح بالسكريبتات
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.googletagmanager.com https://*.firebaseio.com",
      // السماح بالاتصالات
      "connect-src 'self' https://*.firebaseio.com https://*.firebase.google.com https://*.cloudinary.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com wss://*.firebaseio.com https://api.whatsapp.com",
      // السماح بالستايلات
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // السماح بالإطارات
      "frame-src 'self' https://*.firebaseapp.com https://*.firebase.google.com",
      // السماح بالميديا
      "media-src 'self' blob: https://res.cloudinary.com",
      // السماح بالـ Web Workers
      "worker-src 'self' blob:",
      // السماح بالمانيفست
      "manifest-src 'self'",
      // منع الـ Object و Embed (حماية من هجمات الفلاش)
      "object-src 'none'",
      // السماح للـ Base URI
      "base-uri 'self'",
      // منع تحميل النماذج من مصادر خارجية
      "form-action 'self'",
      // السماح للـ Frame Ancestors (حماية من Clickjacking)
      "frame-ancestors 'none'",
      // حظر الـ upgrade-insecure-requests
      "upgrade-insecure-requests",
      // الإبلاغ عن أي انتهاكات للـ CSP
      "report-uri /api/csp-report",
    ].join('; '),
  },

  // ----------------------------------------------------------
  // منع تحميل الصفحة داخل إطار Iframe (Clickjacking Protection)
  // ----------------------------------------------------------
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },

  // ----------------------------------------------------------
  // منع المتصفح من تخمين نوع المحتوى (MIME Sniffing)
  // ----------------------------------------------------------
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },

  // ----------------------------------------------------------
  // إحالات HTTP - تقليل تسريب المعلومات
  // ----------------------------------------------------------
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },

  // ----------------------------------------------------------
  // سياسة الأذونات - Permissions Policy
  // ----------------------------------------------------------
  {
    key: 'Permissions-Policy',
    value: [
      'camera=(self)',
      'microphone=()',
      'geolocation=()',
      'interest-cohort=()',
      'payment=()',
      'usb=()',
      'bluetooth=()',
      'autoplay=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'gyroscope=()',
      'magnetometer=()',
      'midi=()',
      'picture-in-picture=()',
      'sync-xhr=(self)',
      'xr-spatial-tracking=()',
    ].join(', '),
  },

  // ----------------------------------------------------------
  // منع التخزين المؤقت للمتصفح للبيانات الحساسة
  // ----------------------------------------------------------
  {
    key: 'Cache-Control',
    value: 'no-store, max-age=0, must-revalidate',
  },

  // ----------------------------------------------------------
  // خادم الويب - إخفاء معلومات السيرفر
  // ----------------------------------------------------------
  {
    key: 'Server',
    value: 'ITWS Security Gateway',
  },

  // ----------------------------------------------------------
  // سياسة الشهادات - Certificate Transparency
  // ----------------------------------------------------------
  {
    key: 'Expect-CT',
    value: 'max-age=86400, enforce',
  },

  // ----------------------------------------------------------
  // حماية Strict Transport Security (HSTS)
  // ----------------------------------------------------------
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },

  // ----------------------------------------------------------
  // Cross-Origin Resource Policy
  // ----------------------------------------------------------
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },

  // ----------------------------------------------------------
  // Cross-Origin Opener Policy
  // ----------------------------------------------------------
  {
    key: 'Cross-Origin-Opener-Policy',
    value: 'same-origin',
  },

  // ----------------------------------------------------------
  // Cross-Origin Embedder Policy
  // ----------------------------------------------------------
  {
    key: 'Cross-Origin-Embedder-Policy',
    value: 'require-corp',
  },
];

// ============================================================
// تكوين Next.js
// ============================================================
const nextConfig = {
  // ----------------------------------------------------------
  // وضع React الصارم - لتطوير أفضل
  // ----------------------------------------------------------
  reactStrictMode: true,

  // ----------------------------------------------------------
  // ضغط الصور التلقائي
  // ----------------------------------------------------------
  images: {
    domains: imageDomains,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 ساعة
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/itwmembers/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        pathname: '/v0/b/itws-members-systems.firebasestorage.app/**',
      },
    ],
  },

  // ----------------------------------------------------------
  // إعدادات التجربة - ميزات Next.js الجديدة
  // ----------------------------------------------------------
  experimental: {
    // تحسين الأمان
    serverActions: {
      bodySizeLimit: '10mb', // الحد الأقصى لرفع الملفات
      allowedOrigins: allowedOrigins,
    },
    // تحسين الأداء
    optimizePackageImports: [
      'firebase',
      'framer-motion',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'lucide-react',
    ],
    // تحسين الـ CSS
    optimizeCss: true,
    // دعم WebAssembly للتطبيقات الثقيلة
    webpackBuildWorker: true,
    // تسريع التحميل
    turbo: {
      loaders: {},
    },
  },

  // ----------------------------------------------------------
  // ضغط المخرجات
  // ----------------------------------------------------------
  compress: true,

  // ----------------------------------------------------------
  // تعطيل X-Powered-By لأمان إضافي
  // ----------------------------------------------------------
  poweredByHeader: false,

  // ----------------------------------------------------------
  // إنشاء ETag للملفات الثابتة
  // ----------------------------------------------------------
  generateEtags: true,

  // ----------------------------------------------------------
  // مهلة الصفحات الثابتة
  // ----------------------------------------------------------
  staticPageGenerationTimeout: 120,

  // ----------------------------------------------------------
  // تكوين Webpack - تحسينات الأمان والأداء
  // ----------------------------------------------------------
  webpack: (config, { isServer, dev, webpack }) => {
    // إضافة DefinePlugin لمنع تسريب معلومات البيئة
    config.plugins.push(
      new webpack.DefinePlugin({
        'process.env.NEXT_PUBLIC_BUILD_TIME': JSON.stringify(new Date().toISOString()),
        'process.env.NEXT_PUBLIC_BUILD_ID': JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA || 'development'),
        'process.env.__DEV_MODE__': JSON.stringify(dev),
        'process.env.__IS_SERVER__': JSON.stringify(isServer),
      })
    );

    // منع تحميل مكتبات Node.js على جانب العميل
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        child_process: false,
        worker_threads: false,
        crypto: require.resolve('crypto-js'),
        stream: false,
        os: false,
        path: false,
        zlib: false,
        http: false,
        https: false,
        url: false,
        util: false,
        assert: false,
        buffer: false,
      };
    }

    // تقسيم الكود لتحسين الأداء والأمان
    config.optimization.splitChunks = {
      chunks: 'all',
      maxInitialRequests: 25,
      minSize: 20000,
      cacheGroups: {
        // مكتبات React منفصلة
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
          name: 'vendor-react',
          chunks: 'all',
          priority: 100,
          enforce: true,
        },
        // مكتبات Firebase منفصلة
        firebase: {
          test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
          name: 'vendor-firebase',
          chunks: 'all',
          priority: 90,
          enforce: true,
        },
        // مكتبات Three.js منفصلة
        three: {
          test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
          name: 'vendor-three',
          chunks: 'all',
          priority: 80,
          enforce: true,
        },
        // باقي المكتبات
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor-common',
          chunks: 'all',
          priority: 10,
          enforce: true,
        },
        // المكونات المشتركة
        common: {
          name: 'common',
          minChunks: 3,
          chunks: 'all',
          priority: 5,
          reuseExistingChunk: true,
        },
      },
    };

    // منع الـ Source Maps في الإنتاج
    if (!dev) {
      config.devtool = false;
    }

    // إضافة تعليقات أمان للملفات المجمعة
    config.plugins.push(
      new webpack.BannerPlugin({
        banner: `
        🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
        ⚠️ تحذير أمني: هذا الكود ملكية خاصة
        ⚠️ أي محاولة للوصول غير المصرح به أو التعديل
        ⚠️ ستؤدي إلى الملاحقة القانونية
        © ${new Date().getFullYear()} ITWS - جميع الحقوق محفوظة
        `,
        entryOnly: true,
      })
    );

    return config;
  },

  // ----------------------------------------------------------
  // إعادة التوجيه - Redirections
  // ----------------------------------------------------------
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
      {
        source: '/register',
        destination: '/auth/register',
        permanent: true,
      },
      {
        source: '/.env',
        destination: '/404',
        permanent: true,
      },
      {
        source: '/wp-admin',
        destination: '/404',
        permanent: true,
      },
    ];
  },

  // ----------------------------------------------------------
  // إعادة الكتابة - Rewrites (لحماية المسارات الداخلية)
  // ----------------------------------------------------------
  async rewrites() {
    return {
      beforeFiles: [
        // حماية API Routes
        {
          source: '/api/internal/:path*',
          destination: '/api/forbidden',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },

  // ----------------------------------------------------------
  // الهيدرات المخصصة
  // ----------------------------------------------------------
  async headers() {
    return [
      {
        // تطبيق الهيدرات الأمنية على جميع الصفحات
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        // هيدرات خاصة لصفحات API
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigins[0],
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-CSRF-Token, X-Requested-With',
          },
          {
            key: 'Access-Control-Max-Age',
            value: '86400',
          },
          {
            key: 'X-RateLimit-Limit',
            value: '100',
          },
          {
            key: 'X-RateLimit-Remaining',
            value: '99',
          },
        ],
      },
      {
        // هيدرات للملفات الثابتة
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // منع الوصول للملفات الحساسة
        source: '/:path(.env|.env.local|.env.production|package.json|yarn.lock|next.config.js)',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
    ];
  },

  // ----------------------------------------------------------
  // متغيرات البيئة العامة (المسموح بكشفها للعميل)
  // ----------------------------------------------------------
  env: {
    NEXT_PUBLIC_APP_NAME: 'نقابة تكنولوجيا المعلومات والبرمجيات',
    NEXT_PUBLIC_APP_SHORT_NAME: 'ITWS',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
    NEXT_PUBLIC_APP_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: 'itwmembers',
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: 'itwsmembers',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'itws-members-systems',
  },

  // ----------------------------------------------------------
  // تكوين i18n (اختياري للمستقبل)
  // ----------------------------------------------------------
  i18n: {
    locales: ['ar', 'en'],
    defaultLocale: 'ar',
    localeDetection: true,
    domains: [
      {
        domain: 'itws-syndicate.vercel.app',
        defaultLocale: 'ar',
      },
    ],
  },

  // ----------------------------------------------------------
  // إعدادات الإخراج
  // ----------------------------------------------------------
  output: 'standalone',

  // ----------------------------------------------------------
  // تحسينات TypeScript
  // ----------------------------------------------------------
  typescript: {
    ignoreBuildErrors: false,
    tsconfigPath: './tsconfig.json',
  },

  // ----------------------------------------------------------
  // تحسينات ESLint
  // ----------------------------------------------------------
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks', 'types'],
  },

  // ----------------------------------------------------------
  // تكوين الصفحات
  // ----------------------------------------------------------
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // ----------------------------------------------------------
  // مسارات API
  // ----------------------------------------------------------
  distDir: '.next',

  // ----------------------------------------------------------
  // مهلة الدوال
  // ----------------------------------------------------------
  serverRuntimeConfig: {
    maxDuration: 300, // 5 دقائق كحد أقصى
  },

  // ----------------------------------------------------------
  // إعدادات عامة
  // ----------------------------------------------------------
  publicRuntimeConfig: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    environment: process.env.NODE_ENV,
  },
};

// تصدير الإعدادات
module.exports = withBundleAnalyzer(nextConfig);
