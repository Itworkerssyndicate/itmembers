/** @type {import('tailwindcss').Config} */

// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// إعدادات Tailwind CSS - التصميم التكنولوجي الفخم
// آخر تحديث: 2026-06-18
// ============================================================

const plugin = require('tailwindcss/plugin');

module.exports = {
  // ----------------------------------------------------------
  // المحتوى - كل الملفات اللي هيستخدم فيها Tailwind
  // ----------------------------------------------------------
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './types/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  // ----------------------------------------------------------
  // الوضع الداكن - Class-based
  // ----------------------------------------------------------
  darkMode: 'class',

  // ----------------------------------------------------------
  // الثيم - التصميم التكنولوجي الفخم
  // ----------------------------------------------------------
  theme: {
    // --------------------------------------------------------
    // الخطوط
    // --------------------------------------------------------
    fontFamily: {
      // الخط العربي الرئيسي
      arabic: ['Tajawal', 'Cairo', 'Almarai', 'sans-serif'],
      // الخط الإنجليزي التقني
      tech: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      // الخط العام
      sans: ['Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
      // خط العناوين
      display: ['Tajawal', 'Cairo', 'sans-serif'],
      // خط الشعارات
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },

    // --------------------------------------------------------
    // الألوان - باليت تكنولوجي فخم
    // --------------------------------------------------------
    colors: {
      // الألوان الأساسية
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',

      // الأسود والأبيض
      black: '#000000',
      white: '#FFFFFF',

      // ------------------------------------------------------
      // اللون الرئيسي - أزرق تكنولوجي فاخر (Primary)
      // ------------------------------------------------------
      primary: {
        50: '#E6F0FF',
        100: '#B3D4FF',
        200: '#80B8FF',
        300: '#4D9CFF',
        400: '#1A80FF',
        500: '#0066FF', // اللون الأساسي
        600: '#0052CC',
        700: '#003D99',
        800: '#002966',
        900: '#001433',
        950: '#000A1A',
      },

      // ------------------------------------------------------
      // اللون الثانوي - بنفسجي إلكتروني (Secondary)
      // ------------------------------------------------------
      secondary: {
        50: '#F3E8FF',
        100: '#D9B8FF',
        200: '#BF88FF',
        300: '#A558FF',
        400: '#8B28FF',
        500: '#7200FF', // اللون الأساسي
        600: '#5B00CC',
        700: '#440099',
        800: '#2E0066',
        900: '#170033',
        950: '#0B001A',
      },

      // ------------------------------------------------------
      // اللون الثالث - سيان نيون (Accent)
      // ------------------------------------------------------
      accent: {
        50: '#E6FFFA',
        100: '#B3FFEE',
        200: '#80FFE2',
        300: '#4DFFD6',
        400: '#1AFFCA',
        500: '#00F0B8', // اللون الأساسي - نيون
        600: '#00C093',
        700: '#00906E',
        800: '#00604A',
        900: '#003025',
        950: '#001812',
      },

      // ------------------------------------------------------
      // ألوان الأمان والحالات
      // ------------------------------------------------------
      success: {
        50: '#E6FFE6',
        100: '#B3FFB3',
        200: '#80FF80',
        300: '#4DFF4D',
        400: '#1AFF1A',
        500: '#00E600',
        600: '#00B800',
        700: '#008A00',
        800: '#005C00',
        900: '#002E00',
        950: '#001700',
      },

      warning: {
        50: '#FFF8E6',
        100: '#FFE9B3',
        200: '#FFDA80',
        300: '#FFCB4D',
        400: '#FFBC1A',
        500: '#FFA500',
        600: '#CC8400',
        700: '#996300',
        800: '#664200',
        900: '#332100',
        950: '#1A1000',
      },

      danger: {
        50: '#FFE6E6',
        100: '#FFB3B3',
        200: '#FF8080',
        300: '#FF4D4D',
        400: '#FF1A1A',
        500: '#E60000',
        600: '#B80000',
        700: '#8A0000',
        800: '#5C0000',
        900: '#2E0000',
        950: '#170000',
      },

      info: {
        50: '#E6F0FF',
        100: '#B3D4FF',
        200: '#80B8FF',
        300: '#4D9CFF',
        400: '#1A80FF',
        500: '#0066FF',
        600: '#0052CC',
        700: '#003D99',
        800: '#002966',
        900: '#001433',
        950: '#000A1A',
      },

      // ------------------------------------------------------
      // ألوان محايدة - داكنة للتكنولوجي
      // ------------------------------------------------------
      neutral: {
        50: '#F8FAFC',
        100: '#E2E8F0',
        200: '#CBD5E1',
        300: '#94A3B8',
        400: '#64748B',
        500: '#475569',
        600: '#334155',
        700: '#1E293B',
        800: '#0F172A',
        900: '#020617',
        950: '#01030B',
      },

      // ------------------------------------------------------
      // ألوان خاصة للتأثيرات التكنولوجية
      // ------------------------------------------------------
      cyber: {
        blue: '#00F0FF',
        purple: '#B800FF',
        pink: '#FF00E5',
        green: '#00FF88',
        orange: '#FF6B00',
        yellow: '#FFD600',
        red: '#FF0044',
        cyan: '#00FFF0',
        neon: '#39FF14',
        electric: '#7B2FFF',
        plasma: '#FF00AA',
        matrix: '#00FF41',
        circuit: '#00B4D8',
        hologram: '#4DFFDF',
        quantum: '#6C00FF',
        photon: '#FFB800',
        pulse: '#00E5FF',
      },

      // ------------------------------------------------------
      // ألوان الزجاج والتأثيرات الشفافة
      // ------------------------------------------------------
      glass: {
        light: 'rgba(255, 255, 255, 0.05)',
        medium: 'rgba(255, 255, 255, 0.1)',
        heavy: 'rgba(255, 255, 255, 0.2)',
        dark: 'rgba(0, 0, 0, 0.2)',
        darker: 'rgba(0, 0, 0, 0.4)',
        darkest: 'rgba(0, 0, 0, 0.6)',
      },

      // ------------------------------------------------------
      // ألوان الخلفيات المتدرجة
      // ------------------------------------------------------
      gradient: {
        from: '#0A0E27',
        via: '#0F0B3B',
        to: '#060918',
      },
    },

    // --------------------------------------------------------
    // أحجام الشاشات (Responsive)
    // --------------------------------------------------------
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      '4xl': '2560px',
    },

    // --------------------------------------------------------
    // التباعد
    // --------------------------------------------------------
    spacing: {
      0: '0px',
      0.5: '2px',
      1: '4px',
      1.5: '6px',
      2: '8px',
      2.5: '10px',
      3: '12px',
      3.5: '14px',
      4: '16px',
      5: '20px',
      6: '24px',
      7: '28px',
      8: '32px',
      9: '36px',
      10: '40px',
      11: '44px',
      12: '48px',
      14: '56px',
      16: '64px',
      18: '72px',
      20: '80px',
      24: '96px',
      28: '112px',
      32: '128px',
      36: '144px',
      40: '160px',
      44: '176px',
      48: '192px',
      52: '208px',
      56: '224px',
      60: '240px',
      64: '256px',
      72: '288px',
      80: '320px',
      96: '384px',
    },

    // --------------------------------------------------------
    // الأنيميشن
    // --------------------------------------------------------
    animation: {
      // حركات الدوائر الإلكترونية
      'circuit-flow': 'circuitFlow 3s linear infinite',
      'circuit-pulse': 'circuitPulse 2s ease-in-out infinite',
      'circuit-dash': 'circuitDash 4s linear infinite',
      
      // حركات النيون
      'neon-glow': 'neonGlow 2s ease-in-out infinite alternate',
      'neon-flicker': 'neonFlicker 0.15s ease-in-out infinite alternate',
      'neon-pulse': 'neonPulse 1.5s ease-in-out infinite',
      
      // حركات الجسيمات الرقمية
      'particle-float': 'particleFloat 6s ease-in-out infinite',
      'particle-drift': 'particleDrift 8s linear infinite',
      'particle-burst': 'particleBurst 0.5s ease-out forwards',
      
      // حركات الشبكة العصبية
      'neural-fire': 'neuralFire 1s ease-in-out infinite',
      'neural-connect': 'neuralConnect 3s linear infinite',
      'neural-pulse': 'neuralPulse 2s ease-in-out infinite',
      
      // حركات الماتريكس
      'matrix-rain': 'matrixRain 2s linear infinite',
      'matrix-fade': 'matrixFade 3s ease-in-out infinite',
      'matrix-glitch': 'matrixGlitch 0.3s steps(2) infinite',
      
      // حركات الهولوجرام
      'hologram-rotate': 'hologramRotate 10s linear infinite',
      'hologram-shimmer': 'hologramShimmer 2s ease-in-out infinite',
      'hologram-scan': 'hologramScan 4s linear infinite',
      
      // حركات الحدود الإلكترونية
      'border-glow': 'borderGlow 2s ease-in-out infinite alternate',
      'border-dash': 'borderDash 1s linear infinite',
      'border-circuit': 'borderCircuit 5s linear infinite',
      
      // حركات التحميل
      'loading-spin': 'spin 1s linear infinite',
      'loading-pulse': 'pulse 1.5s ease-in-out infinite',
      'loading-bounce': 'bounce 1s ease-in-out infinite',
      
      // حركات دخول وخروج
      'fade-in': 'fadeIn 0.5s ease-out forwards',
      'fade-out': 'fadeOut 0.5s ease-in forwards',
      'slide-up': 'slideUp 0.5s ease-out forwards',
      'slide-down': 'slideDown 0.5s ease-out forwards',
      'slide-left': 'slideLeft 0.5s ease-out forwards',
      'slide-right': 'slideRight 0.5s ease-out forwards',
      'scale-in': 'scaleIn 0.3s ease-out forwards',
      'scale-out': 'scaleOut 0.3s ease-in forwards',
      
      // حركات خاصة
      'typewriter': 'typewriter 3s steps(40) forwards',
      'blink-cursor': 'blinkCursor 1s step-end infinite',
      'scan-line': 'scanLine 8s linear infinite',
      'glitch-text': 'glitchText 0.5s ease-in-out infinite',
      'digital-noise': 'digitalNoise 0.1s steps(5) infinite',
      'cyber-rotate': 'cyberRotate 20s linear infinite',
      'pulse-ring': 'pulseRing 2s ease-out infinite',
      'ripple': 'ripple 1s ease-out forwards',
      'shimmer': 'shimmer 2s linear infinite',
      'breathe': 'breathe 4s ease-in-out infinite',
      'float': 'float 6s ease-in-out infinite',
    },

    // --------------------------------------------------------
    // إطارات الحركة (Keyframes)
    // --------------------------------------------------------
    keyframes: {
      // الدوائر الإلكترونية
      circuitFlow: {
        '0%': { strokeDashoffset: '1000' },
        '100%': { strokeDashoffset: '0' },
      },
      circuitPulse: {
        '0%, 100%': { opacity: '0.3', strokeWidth: '1' },
        '50%': { opacity: '1', strokeWidth: '3' },
      },
      circuitDash: {
        '0%': { strokeDashoffset: '2000' },
        '100%': { strokeDashoffset: '-2000' },
      },

      // النيون
      neonGlow: {
        '0%, 100%': { textShadow: '0 0 4px currentColor, 0 0 8px currentColor, 0 0 12px currentColor' },
        '50%': { textShadow: '0 0 8px currentColor, 0 0 16px currentColor, 0 0 24px currentColor, 0 0 32px currentColor' },
      },
      neonFlicker: {
        '0%, 100%': { opacity: '1' },
        '50%': { opacity: '0.85' },
      },
      neonPulse: {
        '0%, 100%': { boxShadow: '0 0 5px currentColor, 0 0 10px currentColor' },
        '50%': { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor' },
      },

      // الجسيمات
      particleFloat: {
        '0%, 100%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
        '25%': { transform: 'translateY(-20px) translateX(10px)', opacity: '0.8' },
        '50%': { transform: 'translateY(-40px) translateX(-5px)', opacity: '1' },
        '75%': { transform: 'translateY(-60px) translateX(15px)', opacity: '0.5' },
      },
      particleDrift: {
        '0%': { transform: 'translateX(0) translateY(0)' },
        '100%': { transform: 'translateX(100vw) translateY(100vh)' },
      },
      particleBurst: {
        '0%': { transform: 'scale(0) rotate(0deg)', opacity: '1' },
        '100%': { transform: 'scale(2) rotate(180deg)', opacity: '0' },
      },

      // الشبكة العصبية
      neuralFire: {
        '0%, 100%': { stroke: '#00F0FF', strokeWidth: '1', filter: 'blur(0px)' },
        '50%': { stroke: '#B800FF', strokeWidth: '3', filter: 'blur(2px)' },
      },
      neuralConnect: {
        '0%': { strokeDashoffset: '500' },
        '100%': { strokeDashoffset: '0' },
      },
      neuralPulse: {
        '0%, 100%': { r: '3', fill: '#00F0FF' },
        '50%': { r: '6', fill: '#B800FF' },
      },

      // الماتريكس
      matrixRain: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(100vh)' },
      },
      matrixFade: {
        '0%, 100%': { opacity: '0.3' },
        '50%': { opacity: '1' },
      },
      matrixGlitch: {
        '0%': { transform: 'translate(0)' },
        '33%': { transform: 'translate(-2px, 2px)' },
        '66%': { transform: 'translate(2px, -2px)' },
        '100%': { transform: 'translate(0)' },
      },

      // الهولوجرام
      hologramRotate: {
        '0%': { transform: 'rotateY(0deg)' },
        '100%': { transform: 'rotateY(360deg)' },
      },
      hologramShimmer: {
        '0%, 100%': { opacity: '0.5', backgroundPosition: '0% 50%' },
        '50%': { opacity: '1', backgroundPosition: '100% 50%' },
      },
      hologramScan: {
        '0%': { top: '0%' },
        '100%': { top: '100%' },
      },

      // الحدود الإلكترونية
      borderGlow: {
        '0%, 100%': { borderColor: 'rgba(0, 240, 255, 0.3)', boxShadow: '0 0 5px rgba(0, 240, 255, 0.2)' },
        '50%': { borderColor: 'rgba(0, 240, 255, 0.8)', boxShadow: '0 0 20px rgba(0, 240, 255, 0.5), 0 0 40px rgba(0, 240, 255, 0.3)' },
      },
      borderDash: {
        '0%': { strokeDashoffset: '100' },
        '100%': { strokeDashoffset: '0' },
      },
      borderCircuit: {
        '0%': { strokeDashoffset: '2000' },
        '100%': { strokeDashoffset: '0' },
      },

      // حركات الدخول
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      fadeOut: {
        '0%': { opacity: '1' },
        '100%': { opacity: '0' },
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideDown: {
        '0%': { transform: 'translateY(-20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      },
      slideLeft: {
        '0%': { transform: 'translateX(20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      slideRight: {
        '0%': { transform: 'translateX(-20px)', opacity: '0' },
        '100%': { transform: 'translateX(0)', opacity: '1' },
      },
      scaleIn: {
        '0%': { transform: 'scale(0.9)', opacity: '0' },
        '100%': { transform: 'scale(1)', opacity: '1' },
      },
      scaleOut: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(0.9)', opacity: '0' },
      },

      // حركات خاصة
      typewriter: {
        '0%': { width: '0' },
        '100%': { width: '100%' },
      },
      blinkCursor: {
        '0%, 100%': { borderColor: 'transparent' },
        '50%': { borderColor: 'currentColor' },
      },
      scanLine: {
        '0%': { transform: 'translateY(-100%)' },
        '100%': { transform: 'translateY(100vh)' },
      },
      glitchText: {
        '0%, 100%': { transform: 'translate(0)' },
        '20%': { transform: 'translate(-2px, 2px)' },
        '40%': { transform: 'translate(-2px, -2px)' },
        '60%': { transform: 'translate(2px, 2px)' },
        '80%': { transform: 'translate(2px, -2px)' },
      },
      digitalNoise: {
        '0%': { transform: 'translate(0)' },
        '10%': { transform: 'translate(-5%, -5%)' },
        '20%': { transform: 'translate(-10%, 5%)' },
        '30%': { transform: 'translate(5%, -10%)' },
        '40%': { transform: 'translate(-5%, 15%)' },
        '50%': { transform: 'translate(-10%, 5%)' },
        '60%': { transform: 'translate(15%, 0)' },
        '70%': { transform: 'translate(0, 10%)' },
        '80%': { transform: 'translate(-15%, 0)' },
        '90%': { transform: 'translate(10%, 5%)' },
        '100%': { transform: 'translate(5%, 0)' },
      },
      cyberRotate: {
        '0%': { transform: 'rotate(0deg)' },
        '100%': { transform: 'rotate(360deg)' },
      },
      pulseRing: {
        '0%': { transform: 'scale(1)', opacity: '1' },
        '100%': { transform: 'scale(2)', opacity: '0' },
      },
      ripple: {
        '0%': { transform: 'scale(0)', opacity: '1' },
        '100%': { transform: 'scale(4)', opacity: '0' },
      },
      shimmer: {
        '0%': { backgroundPosition: '-200% 0' },
        '100%': { backgroundPosition: '200% 0' },
      },
      breathe: {
        '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
        '50%': { transform: 'scale(1.05)', opacity: '1' },
      },
      float: {
        '0%, 100%': { transform: 'translateY(0px)' },
        '50%': { transform: 'translateY(-10px)' },
      },
    },

    // --------------------------------------------------------
    // الظلال
    // --------------------------------------------------------
    boxShadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

      // ظلال نيون
      'neon-blue': '0 0 5px rgba(0, 240, 255, 0.3), 0 0 10px rgba(0, 240, 255, 0.2), 0 0 15px rgba(0, 240, 255, 0.1)',
      'neon-blue-lg': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(0, 240, 255, 0.2), 0 0 80px rgba(0, 240, 255, 0.1)',
      'neon-purple': '0 0 5px rgba(184, 0, 255, 0.3), 0 0 10px rgba(184, 0, 255, 0.2), 0 0 15px rgba(184, 0, 255, 0.1)',
      'neon-purple-lg': '0 0 10px rgba(184, 0, 255, 0.5), 0 0 20px rgba(184, 0, 255, 0.3), 0 0 40px rgba(184, 0, 255, 0.2), 0 0 80px rgba(184, 0, 255, 0.1)',
      'neon-green': '0 0 5px rgba(0, 255, 136, 0.3), 0 0 10px rgba(0, 255, 136, 0.2), 0 0 15px rgba(0, 255, 136, 0.1)',
      'neon-cyan': '0 0 5px rgba(0, 255, 240, 0.3), 0 0 10px rgba(0, 255, 240, 0.2), 0 0 15px rgba(0, 255, 240, 0.1)',
      
      // ظلال زجاجية
      'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
      'glass-lg': '0 16px 48px 0 rgba(0, 0, 0, 0.5)',
      
      // ظلال تكنولوجية
      'cyber': '0 0 0 1px rgba(0, 240, 255, 0.1), 0 0 20px rgba(0, 240, 255, 0.1)',
      'cyber-lg': '0 0 0 2px rgba(0, 240, 255, 0.2), 0 0 40px rgba(0, 240, 255, 0.2), 0 0 80px rgba(0, 240, 255, 0.1)',
      'hologram': '0 0 30px rgba(77, 255, 223, 0.3), inset 0 0 30px rgba(77, 255, 223, 0.1)',
    },

    // --------------------------------------------------------
    // الخلفيات
    // --------------------------------------------------------
    backgroundImage: {
      none: 'none',
      
      // تدرجات لونية
      'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      
      // تدرجات تكنولوجية
      'tech-gradient': 'linear-gradient(135deg, #0A0E27 0%, #0F0B3B 50%, #060918 100%)',
      'tech-gradient-reverse': 'linear-gradient(225deg, #0A0E27 0%, #0F0B3B 50%, #060918 100%)',
      'cyber-gradient': 'linear-gradient(135deg, #001433 0%, #002966 50%, #003D99 100%)',
      'neon-gradient': 'linear-gradient(90deg, #00F0FF 0%, #B800FF 50%, #FF00E5 100%)',
      'neon-gradient-vertical': 'linear-gradient(180deg, #00F0FF 0%, #B800FF 50%, #FF00E5 100%)',
      'hologram-gradient': 'linear-gradient(135deg, rgba(77, 255, 223, 0.1) 0%, rgba(0, 240, 255, 0.2) 50%, rgba(108, 0, 255, 0.1) 100%)',
      'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
      'dark-gradient': 'linear-gradient(180deg, #020617 0%, #0F172A 50%, #1E293B 100%)',
      
      // خطوط المسح
      'scan-lines': 'repeating-linear-gradient(0deg, rgba(0, 240, 255, 0.03) 0px, rgba(0, 240, 255, 0.03) 1px, transparent 1px, transparent 2px)',
      
      // شبكات
      'grid-pattern': 'linear-gradient(rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.05) 1px, transparent 1px)',
      'dot-pattern': 'radial-gradient(rgba(0, 240, 255, 0.1) 1px, transparent 1px)',
      
      // تأثيرات
      'noise': 'url("/images/noise.png")',
      'circuit-board': 'url("/images/circuit-board.svg")',
    },

    // --------------------------------------------------------
    // نصف القطر
    // --------------------------------------------------------
    borderRadius: {
      none: '0px',
      sm: '2px',
      DEFAULT: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
      '2xl': '16px',
      '3xl': '24px',
      full: '9999px',
    },

    // --------------------------------------------------------
    // مؤثرات التعتيم
    // --------------------------------------------------------
    backdropBlur: {
      none: '0px',
      sm: '4px',
      DEFAULT: '8px',
      md: '12px',
      lg: '16px',
      xl: '24px',
      '2xl': '40px',
      '3xl': '64px',
    },

    // --------------------------------------------------------
    // الشفافية
    // --------------------------------------------------------
    opacity: {
      0: '0',
      5: '0.05',
      10: '0.1',
      15: '0.15',
      20: '0.2',
      25: '0.25',
      30: '0.3',
      35: '0.35',
      40: '0.4',
      45: '0.45',
      50: '0.5',
      55: '0.55',
      60: '0.6',
      65: '0.65',
      70: '0.7',
      75: '0.75',
      80: '0.8',
      85: '0.85',
      90: '0.9',
      95: '0.95',
      100: '1',
    },

    // --------------------------------------------------------
    // مؤشر Z
    // --------------------------------------------------------
    zIndex: {
      0: '0',
      10: '10',
      20: '20',
      30: '30',
      40: '40',
      50: '50',
      auto: 'auto',
    },
  },

  // ----------------------------------------------------------
  // الإضافات (Plugins)
  // ----------------------------------------------------------
  plugins: [
    // ------------------------------------------------------
    // إضافة Typography
    // ------------------------------------------------------
    require('@tailwindcss/typography'),

    // ------------------------------------------------------
    // إضافات مخصصة
    // ------------------------------------------------------
    plugin(function({ addUtilities, addComponents, addBase, theme, addVariant }) {
      
      // --------------------------------------------------
      // أنماط أساسية
      // --------------------------------------------------
      addBase({
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${theme('colors.cyber.blue')} ${theme('colors.neutral.900')}`,
        },
        '*::-webkit-scrollbar': {
          width: '6px',
          height: '6px',
        },
        '*::-webkit-scrollbar-track': {
          background: theme('colors.neutral.900'),
          borderRadius: '3px',
        },
        '*::-webkit-scrollbar-thumb': {
          background: `linear-gradient(180deg, ${theme('colors.cyber.blue')}, ${theme('colors.cyber.purple')})`,
          borderRadius: '3px',
          border: `1px solid ${theme('colors.neutral.800')}`,
        },
        '*::-webkit-scrollbar-thumb:hover': {
          background: `linear-gradient(180deg, ${theme('colors.cyber.cyan')}, ${theme('colors.cyber.electric')})`,
        },
        '::selection': {
          backgroundColor: theme('colors.cyber.blue'),
          color: theme('colors.neutral.900'),
        },
        'html': {
          direction: 'rtl',
          scrollBehavior: 'smooth',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        'body': {
          backgroundColor: theme('colors.neutral.950'),
          color: theme('colors.neutral.100'),
          fontFamily: theme('fontFamily.arabic').join(', '),
        },
        'input, textarea, select': {
          fontSize: '16px', // منع الزووم في الموبايل
        },
      });

      // --------------------------------------------------
      // مركبات (Components)
      // --------------------------------------------------
      addComponents({
        // ----------------------------------------------
        // زجاج تكنولوجي
        // ----------------------------------------------
        '.glass-panel': {
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0, 240, 255, 0.1)',
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.glass'),
        },
        '.glass-panel-sm': {
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0, 240, 255, 0.05)',
          borderRadius: theme('borderRadius.xl'),
          boxShadow: theme('boxShadow.glass-sm'),
        },
        '.glass-panel-lg': {
          backgroundColor: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(0, 240, 255, 0.15)',
          borderRadius: theme('borderRadius.3xl'),
          boxShadow: theme('boxShadow.glass-lg'),
        },

        // ----------------------------------------------
        // بطاقات هولوجرام
        // ----------------------------------------------
        '.holographic-card': {
          background: `linear-gradient(135deg, rgba(77, 255, 223, 0.05) 0%, rgba(0, 240, 255, 0.1) 50%, rgba(108, 0, 255, 0.05) 100%)`,
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(77, 255, 223, 0.2)',
          borderRadius: theme('borderRadius.2xl'),
          boxShadow: theme('boxShadow.hologram'),
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(77, 255, 223, 0.5), transparent)',
            animation: 'hologramScan 4s linear infinite',
          },
        },

        // ----------------------------------------------
        // حدود نيون
        // ----------------------------------------------
        '.neon-border': {
          border: '1px solid rgba(0, 240, 255, 0.3)',
          boxShadow: '0 0 5px rgba(0, 240, 255, 0.2), 0 0 10px rgba(0, 240, 255, 0.1), inset 0 0 5px rgba(0, 240, 255, 0.05)',
        },
        '.neon-border-blue': {
          border: '1px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 0 10px rgba(0, 240, 255, 0.3), 0 0 20px rgba(0, 240, 255, 0.2), 0 0 40px rgba(0, 240, 255, 0.1)',
        },
        '.neon-border-purple': {
          border: '1px solid rgba(184, 0, 255, 0.4)',
          boxShadow: '0 0 10px rgba(184, 0, 255, 0.3), 0 0 20px rgba(184, 0, 255, 0.2), 0 0 40px rgba(184, 0, 255, 0.1)',
        },

        // ----------------------------------------------
        // نص نيون
        // ----------------------------------------------
        '.neon-text': {
          color: theme('colors.white'),
          textShadow: '0 0 7px currentColor, 0 0 10px currentColor, 0 0 21px currentColor',
        },
        '.neon-text-blue': {
          color: theme('colors.cyber.blue'),
          textShadow: '0 0 4px rgba(0, 240, 255, 0.5), 0 0 8px rgba(0, 240, 255, 0.3), 0 0 16px rgba(0, 240, 255, 0.2)',
        },
        '.neon-text-purple': {
          color: theme('colors.cyber.purple'),
          textShadow: '0 0 4px rgba(184, 0, 255, 0.5), 0 0 8px rgba(184, 0, 255, 0.3), 0 0 16px rgba(184, 0, 255, 0.2)',
        },
        '.neon-text-green': {
          color: theme('colors.cyber.green'),
          textShadow: '0 0 4px rgba(0, 255, 136, 0.5), 0 0 8px rgba(0, 255, 136, 0.3), 0 0 16px rgba(0, 255, 136, 0.2)',
        },

        // ----------------------------------------------
        // خطوط الدوائر الإلكترونية
        // ----------------------------------------------
        '.circuit-lines': {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: '0',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%2300F0FF' stroke-width='0.5' stroke-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            opacity: '0.5',
            pointerEvents: 'none',
          },
        },

        // ----------------------------------------------
        // زر تكنولوجي
        // ----------------------------------------------
        '.btn-cyber': {
          position: 'relative',
          padding: '12px 24px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.1), rgba(184, 0, 255, 0.1))',
          border: '1px solid rgba(0, 240, 255, 0.3)',
          borderRadius: theme('borderRadius.lg'),
          color: theme('colors.white'),
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(184, 0, 255, 0.2))',
            border: '1px solid rgba(0, 240, 255, 0.6)',
            boxShadow: '0 0 20px rgba(0, 240, 255, 0.3), 0 0 40px rgba(184, 0, 255, 0.2)',
            transform: 'translateY(-2px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
            transition: 'left 0.5s ease',
          },
          '&:hover::before': {
            left: '100%',
          },
        },

        // ----------------------------------------------
        // تأثير جلو
        // ----------------------------------------------
        '.glow-on-hover': {
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 0 15px rgba(0, 240, 255, 0.4), 0 0 30px rgba(0, 240, 255, 0.2), 0 0 45px rgba(0, 240, 255, 0.1)',
          },
        },

        // ----------------------------------------------
        // خط المسح
        // ----------------------------------------------
        '.scan-line-effect': {
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '0',
            right: '0',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.5), transparent)',
            animation: 'scanLine 8s linear infinite',
          },
        },
      });

      // --------------------------------------------------
      // أدوات مساعدة (Utilities)
      // --------------------------------------------------
      addUtilities({
        // كتابة من اليمين لليسار
        '.text-rtl': {
          direction: 'rtl',
          textAlign: 'right',
        },
        '.text-ltr': {
          direction: 'ltr',
          textAlign: 'left',
        },

        // إخفاء شريط التمرير
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },

        // تأثيرات كتابية
        '.text-gradient-cyber': {
          background: 'linear-gradient(135deg, #00F0FF, #B800FF, #FF00E5)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-neon': {
          background: 'linear-gradient(90deg, #00F0FF, #00FF88)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.text-gradient-hologram': {
          background: 'linear-gradient(135deg, #4DFFDF, #00F0FF, #6C00FF)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },

        // تأثيرات ثلاثية الأبعاد
        '.perspective-1000': {
          perspective: '1000px',
        },
        '.preserve-3d': {
          transformStyle: 'preserve-3d',
        },
        '.backface-hidden': {
          backfaceVisibility: 'hidden',
        },

        // أقنعة
        '.mask-circuit': {
          maskImage: 'url("/images/circuit-mask.svg")',
          maskSize: 'cover',
          maskRepeat: 'no-repeat',
        },
        '.mask-hexagon': {
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        },

        // تأثيرات الحركة
        '.animate-float': {
          animation: 'float 6s ease-in-out infinite',
        },
        '.animate-pulse-slow': {
          animation: 'pulse 3s ease-in-out infinite',
        },
        '.animate-glow': {
          animation: 'neonGlow 2s ease-in-out infinite alternate',
        },
      });
    }),

    // ------------------------------------------------------
    // متغيرات مخصصة
    // ------------------------------------------------------
    plugin(function({ addVariant }) {
      addVariant('hocus', ['&:hover', '&:focus']);
      addVariant('group-hocus', [':merge(.group):hover &', ':merge(.group):focus &']);
      addVariant('rtl', '[dir="rtl"] &');
      addVariant('ltr', '[dir="ltr"] &');
      addVariant('firefox', '@supports (-moz-appearance:none)');
      addVariant('safari', '@supports (-webkit-hyphens:none)');
      addVariant('not-last', '&:not(:last-child)');
      addVariant('not-first', '&:not(:first-child)');
      addVariant('aria-current', '&[aria-current="page"]');
    }),
  ],

  // ----------------------------------------------------------
  // قيم افتراضية للمستقبل
  // ----------------------------------------------------------
  future: {
    hoverOnlyWhenSupported: true,
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
    relativeContentPathsByDefault: true,
  },
};
