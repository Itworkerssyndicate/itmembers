// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// صفحة دخول النظام - Login Page
// تحتوي على: مصادقة Firebase، حماية من القوة العمياء،
// دعم البصمة الحيوية، تسجيل المحاولات، تحويل ذكي للفروع
// آخر تحديث: 2026-06-18
// ============================================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

// ----------------------------------------------------------
// Firebase
// ----------------------------------------------------------
import {
  signInWithEmailAndPassword,
  signInWithCustomToken,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  AuthErrorCodes,
} from 'firebase/auth';
import { auth } from '@/lib/firebase/config';

// ----------------------------------------------------------
// المكونات
// ----------------------------------------------------------
import { GlitchText } from '@/components/ui/GlitchText';
import { CyberBorder } from '@/components/ui/CyberBorder';
import { HolographicCard } from '@/components/ui/HolographicCard';
import { NeuralNetwork } from '@/components/ui/NeuralNetwork';
import { CircuitLines } from '@/components/ui/CircuitLines';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

// ----------------------------------------------------------
// الأيقونات
// ----------------------------------------------------------
import {
  HiEye,
  HiEyeSlash,
  HiLockClosed,
  HiEnvelope,
  HiExclamationCircle,
  HiCheckCircle,
  HiArrowRight,
  HiKey,
  HiShieldCheck,
  HiFingerPrint,
  HiDevicePhoneMobile,
} from 'react-icons/hi2';
import {
  MdSecurity,
  MdEmail,
  MdLock,
  MdVisibility,
  MdVisibilityOff,
  MdFingerprint,
  MdQrCodeScanner,
} from 'react-icons/md';
import {
  RiShieldKeyholeLine,
  RiCpuLine,
  RiFingerprintLine,
  RiSmartphoneLine,
} from 'react-icons/ri';

// ----------------------------------------------------------
// المكتبات
// ----------------------------------------------------------
import { useAuth } from '@/lib/auth/useAuth';
import { useBiometricAuth } from '@/lib/auth/BiometricAuth';
import { cn } from '@/lib/utils';
import { validateEmail } from '@/lib/validators';

// ============================================================
// أنواع البيانات
// ============================================================
type LoginMethod = 'email' | 'biometric' | 'google';
type LoginStep = 'credentials' | 'twoFactor' | 'biometric';

interface LoginError {
  code: string;
  message: string;
  field?: 'email' | 'password' | 'twoFactor';
}

// ============================================================
// رسائل الأخطاء المخصصة
// ============================================================
const ERROR_MESSAGES: Record<string, string> = {
  [AuthErrorCodes.INVALID_EMAIL]: 'البريد الإلكتروني غير صالح',
  [AuthErrorCodes.USER_DELETED]: 'لا يوجد حساب بهذا البريد الإلكتروني',
  [AuthErrorCodes.INVALID_PASSWORD]: 'كلمة المرور غير صحيحة',
  [AuthErrorCodes.USER_DISABLED]: 'تم تعطيل هذا الحساب - راجع النقيب العام',
  [AuthErrorCodes.TOO_MANY_ATTEMPTS]: 'محاولات كثيرة - الرجاء المحاولة لاحقاً',
  [AuthErrorCodes.NETWORK_REQUEST_FAILED]: 'فشل الاتصال بالخادم - تحقق من الإنترنت',
  'auth/invalid-credential': 'بيانات الدخول غير صحيحة',
  'auth/session-expired': 'انتهت الجلسة - الرجاء إعادة الدخول',
  'auth/requires-recent-login': 'يجب إعادة تسجيل الدخول للعمليات الحساسة',
  'auth/account-not-approved': 'الحساب لم يتم اعتماده بعد من النقيب العام',
};

// ============================================================
// المكون الرئيسي
// ============================================================
export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { isBiometricAvailable, authenticateWithBiometric } = useBiometricAuth();
  
  // ----------------------------------------------------------
  // الحالة
  // ----------------------------------------------------------
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('email');
  const [currentStep, setCurrentStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LoginError | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimer, setBlockTimer] = useState(0);
  
  // ----------------------------------------------------------
  // المراجع
  // ----------------------------------------------------------
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const twoFactorRef = useRef<HTMLInputElement>(null);
  
  // ----------------------------------------------------------
  // إعادة التوجيه إذا كان مسجل الدخول
  // ----------------------------------------------------------
  useEffect(() => {
    if (!authLoading && user) {
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
    }
  }, [user, authLoading, router, searchParams]);
  
  // ----------------------------------------------------------
  // عداد الحظر
  // ----------------------------------------------------------
  useEffect(() => {
    if (isBlocked && blockTimer > 0) {
      const timer = setInterval(() => {
        setBlockTimer((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimer]);
  
  // ----------------------------------------------------------
  // محاولات الفشل والحظر
  // ----------------------------------------------------------
  const handleFailedAttempt = useCallback(() => {
    const newAttempts = failedAttempts + 1;
    setFailedAttempts(newAttempts);
    
    if (newAttempts >= 5) {
      setIsBlocked(true);
      setBlockTimer(300); // 5 دقائق حظر
      toast.error('تم حظر المحاولات لمدة 5 دقائق - لأسباب أمنية');
      
      // تسجيل في Firebase
      fetch('/api/security/failed-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, timestamp: new Date().toISOString() }),
      }).catch(() => {});
    }
  }, [failedAttempts, email]);
  
  // ----------------------------------------------------------
  // الدخول بالبريد وكلمة المرور
  // ----------------------------------------------------------
  const handleEmailLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      toast.error(`محظور - انتظر ${Math.ceil(blockTimer / 60)} دقيقة`);
      return;
    }
    
    // التحقق من صحة الإدخال
    if (!email.trim()) {
      setError({ code: 'required', message: 'البريد الإلكتروني مطلوب', field: 'email' });
      emailRef.current?.focus();
      return;
    }
    
    if (!validateEmail(email)) {
      setError({ code: 'invalid-email', message: 'صيغة البريد غير صحيحة', field: 'email' });
      emailRef.current?.focus();
      return;
    }
    
    if (!password) {
      setError({ code: 'required', message: 'كلمة المرور مطلوبة', field: 'password' });
      passwordRef.current?.focus();
      return;
    }
    
    if (password.length < 8) {
      setError({ code: 'short-password', message: 'كلمة المرور 8 أحرف على الأقل', field: 'password' });
      passwordRef.current?.focus();
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // التحقق من صلاحية الحساب في Firestore
      const token = await userCredential.user.getIdToken();
      const verifyResponse = await fetch('/api/auth/verify-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!verifyResponse.ok) {
        const verifyError = await verifyResponse.json();
        throw { code: 'auth/account-not-approved', message: verifyError.message };
      }
      
      // نجاح الدخول
      toast.success('تم تسجيل الدخول بنجاح');
      setFailedAttempts(0);
      
      // التوجيه للوحة التحكم
      const redirect = searchParams.get('redirect') || '/dashboard';
      router.push(redirect);
      
    } catch (err: any) {
      const errorCode = err.code || 'unknown';
      const errorMessage = ERROR_MESSAGES[errorCode] || err.message || 'حدث خطأ غير متوقع';
      
      setError({
        code: errorCode,
        message: errorMessage,
        field: errorCode.includes('email') ? 'email' : errorCode.includes('password') ? 'password' : undefined,
      });
      
      handleFailedAttempt();
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isBlocked, blockTimer, router, searchParams, handleFailedAttempt]);
  
  // ----------------------------------------------------------
  // الدخول بالبصمة الحيوية
  // ----------------------------------------------------------
  const handleBiometricLogin = useCallback(async () => {
    if (!isBiometricAvailable) {
      toast.error('البصمة الحيوية غير متاحة على هذا الجهاز');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await authenticateWithBiometric();
      
      if (result.success && result.token) {
        await signInWithCustomToken(auth, result.token);
        toast.success('تم الدخول بالبصمة بنجاح');
        router.push('/dashboard');
      } else {
        throw new Error('فشل التحقق من البصمة');
      }
    } catch (err: any) {
      setError({
        code: 'biometric-failed',
        message: 'فشل الدخول بالبصمة - استخدم البريد وكلمة المرور',
      });
      toast.error('فشل الدخول بالبصمة الحيوية');
      setLoginMethod('email');
    } finally {
      setIsLoading(false);
    }
  }, [isBiometricAvailable, authenticateWithBiometric, router]);
  
  // ----------------------------------------------------------
  // الدخول بحساب Google
  // ----------------------------------------------------------
  const handleGoogleLogin = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account',
        hd: 'itws-syndicate.org', // قصر الدخول على إيميلات النقابة
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // التحقق من أن الإيميل تابع للنقابة
      const token = await result.user.getIdToken();
      const verifyResponse = await fetch('/api/auth/verify-access', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!verifyResponse.ok) {
        await auth.signOut();
        throw { code: 'auth/account-not-approved', message: 'هذا الحساب غير مصرح له' };
      }
      
      toast.success('تم الدخول بحساب Google بنجاح');
      router.push('/dashboard');
      
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return;
      }
      const errorMessage = ERROR_MESSAGES[err.code] || err.message || 'فشل الدخول بحساب Google';
      setError({ code: err.code || 'google-failed', message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [router]);
  
  // ----------------------------------------------------------
  // نسيت كلمة المرور
  // ----------------------------------------------------------
  const handleForgotPassword = useCallback(async () => {
    if (!email || !validateEmail(email)) {
      toast.error('الرجاء إدخال بريدك الإلكتروني أولاً');
      emailRef.current?.focus();
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      toast.success('تم إرسال رابط إعادة تعيين كلمة المرور');
    } catch (err: any) {
      toast.error('فشل إرسال رابط إعادة التعيين');
    }
  }, [email]);
  
  // ----------------------------------------------------------
  // حالة التحميل
  // ----------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="جاري التحقق من الجلسة..." />
      </div>
    );
  }
  
  // إذا كان مسجل الدخول (لن يرى هذه الصفحة)
  if (user) {
    return null;
  }
  
  // ============================================================
  // العرض الرئيسي
  // ============================================================
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 py-12">
      {/* ================================================== */}
      {/* الخلفيات */}
      {/* ================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <NeuralNetwork
          nodeCount={25}
          connectionDistance={120}
          colors={['rgba(0, 240, 255, 0.06)', 'rgba(184, 0, 255, 0.04)']}
          animated={true}
        />
        <CircuitLines
          density="low"
          color="cyber-blue"
          animated={true}
          speed={2}
          opacity={0.05}
        />
      </div>
      
      {/* ================================================== */}
      {/* المحتوى */}
      {/* ================================================== */}
      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* ========================================== */}
          {/* الشعار والعنوان */}
          {/* ========================================== */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-20 h-20 mx-auto mb-4 relative"
            >
              <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/30 animate-pulse-ring" />
              <div className="absolute inset-2 rounded-full border border-cyber-purple/20 animate-cyber-rotate" />
              <div className="w-full h-full rounded-full bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 backdrop-blur-sm border border-cyber-blue/40 flex items-center justify-center">
                <RiShieldKeyholeLine className="w-10 h-10 text-cyber-blue" />
              </div>
            </motion.div>
            
            <GlitchText
              text="تسجيل الدخول"
              className="text-2xl sm:text-3xl font-bold font-arabic mb-2"
            />
            
            <p className="text-neutral-400 text-sm font-arabic">
              نقابة تكنولوجيا المعلومات والبرمجيات
            </p>
          </div>
          
          {/* ========================================== */}
          {/* بطاقة الدخول */}
          {/* ========================================== */}
          <HolographicCard className="p-6 sm:p-8">
            
            {/* -------------------------------------- */}
            {/* اختيار طريقة الدخول */}
            {/* -------------------------------------- */}
            <div className="flex items-center gap-2 mb-6 p-1 bg-neutral-800/50 rounded-lg border border-neutral-700/30">
              {([
                { id: 'email' as LoginMethod, label: 'البريد', icon: MdEmail },
                { id: 'biometric' as LoginMethod, label: 'البصمة', icon: MdFingerprint, disabled: !isBiometricAvailable },
                { id: 'google' as LoginMethod, label: 'Google', icon: () => (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )},
              ] as const).map((method) => (
                <button
                  key={method.id}
                  onClick={() => !method.disabled && setLoginMethod(method.id)}
                  disabled={method.disabled}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-arabic rounded-md transition-all duration-200',
                    loginMethod === method.id
                      ? 'bg-cyber-blue/20 text-cyber-blue'
                      : method.disabled
                        ? 'text-neutral-600 cursor-not-allowed'
                        : 'text-neutral-400 hover:text-white'
                  )}
                >
                  <method.icon className="w-4 h-4" />
                  {method.label}
                </button>
              ))}
            </div>
            
            {/* -------------------------------------- */}
            {/* نموذج البريد وكلمة المرور */}
            {/* -------------------------------------- */}
            <AnimatePresence mode="wait">
              {loginMethod === 'email' && (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailLogin}
                  className="space-y-4"
                >
                  {/* البريد الإلكتروني */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 font-arabic">
                      البريد الإلكتروني
                    </label>
                    <div className="relative">
                      <MdEmail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                      <input
                        ref={emailRef}
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                        }}
                        placeholder="example@itws-syndicate.org"
                        disabled={isLoading || isBlocked}
                        autoComplete="email"
                        autoFocus
                        dir="ltr"
                        className={cn(
                          'w-full bg-neutral-800/50 border rounded-lg py-2.5 pr-10 pl-4 text-white placeholder:text-neutral-600 font-mono text-sm transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-cyber-blue/50',
                          error?.field === 'email'
                            ? 'border-danger/50 focus:ring-danger/50'
                            : 'border-neutral-700/50',
                          (isLoading || isBlocked) && 'opacity-50 cursor-not-allowed'
                        )}
                      />
                    </div>
                    {error?.field === 'email' && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger text-xs mt-1 font-arabic flex items-center gap-1"
                      >
                        <HiExclamationCircle className="w-3 h-3" />
                        {error.message}
                      </motion.p>
                    )}
                  </div>
                  
                  {/* كلمة المرور */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1.5 font-arabic">
                      كلمة المرور
                    </label>
                    <div className="relative">
                      <MdLock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500 pointer-events-none" />
                      <input
                        ref={passwordRef}
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                        }}
                        placeholder="••••••••"
                        disabled={isLoading || isBlocked}
                        autoComplete="current-password"
                        dir="ltr"
                        className={cn(
                          'w-full bg-neutral-800/50 border rounded-lg py-2.5 pr-10 pl-12 text-white placeholder:text-neutral-600 font-mono text-sm transition-all duration-200',
                          'focus:outline-none focus:ring-2 focus:ring-cyber-blue/50 focus:border-cyber-blue/50',
                          error?.field === 'password'
                            ? 'border-danger/50 focus:ring-danger/50'
                            : 'border-neutral-700/50',
                          (isLoading || isBlocked) && 'opacity-50 cursor-not-allowed'
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <MdVisibilityOff className="w-5 h-5" />
                        ) : (
                          <MdVisibility className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {error?.field === 'password' && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-danger text-xs mt-1 font-arabic flex items-center gap-1"
                      >
                        <HiExclamationCircle className="w-3 h-3" />
                        {error.message}
                      </motion.p>
                    )}
                  </div>
                  
                  {/* خيارات إضافية */}
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-neutral-600 bg-neutral-800 text-cyber-blue focus:ring-cyber-blue/50"
                      />
                      <span className="text-xs text-neutral-400 font-arabic">تذكرني</span>
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-xs text-cyber-blue hover:text-cyber-cyan font-arabic transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  
                  {/* تنبيه الحظر */}
                  {isBlocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-warning/10 border border-warning/30 rounded-lg p-3 flex items-center gap-2"
                    >
                      <HiExclamationCircle className="w-5 h-5 text-warning flex-shrink-0" />
                      <p className="text-warning text-xs font-arabic">
                        محظور مؤقتاً - يرجى الانتظار {Math.ceil(blockTimer / 60)}:{String(blockTimer % 60).padStart(2, '0')} دقيقة
                      </p>
                    </motion.div>
                  )}
                  
                  {/* زر الدخول */}
                  <button
                    type="submit"
                    disabled={isLoading || isBlocked}
                    className={cn(
                      'w-full btn-cyber py-3 font-arabic text-base flex items-center justify-center gap-2',
                      (isLoading || isBlocked) && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {isLoading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        جاري الدخول...
                      </>
                    ) : (
                      <>
                        <HiLockClosed className="w-5 h-5" />
                        دخول
                      </>
                    )}
                  </button>
                </motion.form>
              )}
              
              {/* -------------------------------------- */}
              {/* الدخول بالبصمة */}
              {/* -------------------------------------- */}
              {loginMethod === 'biometric' && (
                <motion.div
                  key="biometric"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center py-6"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyber-blue/10 border-2 border-cyber-blue/30 flex items-center justify-center cursor-pointer"
                    onClick={handleBiometricLogin}
                  >
                    <MdFingerprint className="w-12 h-12 text-cyber-blue" />
                  </motion.div>
                  
                  <p className="text-white font-arabic mb-2">اضغط على البصمة للدخول</p>
                  <p className="text-neutral-400 text-sm font-arabic">
                    استخدم بصمة الإصبع أو الوجه للدخول السريع
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className="mt-4 text-cyber-blue text-sm font-arabic hover:underline"
                  >
                    الدخول بالبريد الإلكتروني بدلاً من ذلك
                  </button>
                </motion.div>
              )}
              
              {/* -------------------------------------- */}
              {/* الدخول بـ Google */}
              {/* -------------------------------------- */}
              {loginMethod === 'google' && (
                <motion.div
                  key="google"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="text-center py-6"
                >
                  <p className="text-neutral-300 font-arabic mb-6">
                    استخدم حساب Google المعتمد من النقابة للدخول
                  </p>
                  
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white text-neutral-900 rounded-lg font-medium font-arabic hover:bg-neutral-100 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    {isLoading ? 'جاري الدخول...' : 'الدخول بحساب Google'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className="mt-4 text-cyber-blue text-sm font-arabic hover:underline"
                  >
                    الدخول بالبريد الإلكتروني بدلاً من ذلك
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
          </HolographicCard>
          
          {/* ========================================== */}
          {/* روابط إضافية */}
          {/* ========================================== */}
          <div className="text-center mt-6">
            <p className="text-neutral-500 text-xs font-arabic">
              تحتاج مساعدة؟{' '}
              <Link href="/support" className="text-cyber-blue hover:underline">
                تواصل مع الدعم الفني
              </Link>
            </p>
          </div>
          
          {/* ========================================== */}
          {/* شريط الأمان */}
          {/* ========================================== */}
          <div className="mt-8 flex items-center justify-center gap-2 text-neutral-600 text-xs font-mono">
            <MdSecurity className="w-3 h-3" />
            <span>اتصال آمن مشفر - TLS 1.3</span>
            <span className="text-neutral-700">|</span>
            <span>ITWS v1.0.0</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
