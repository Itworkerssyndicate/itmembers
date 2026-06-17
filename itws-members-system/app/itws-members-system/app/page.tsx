// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// الصفحة الرئيسية - بوابة التقديم الذكية
// تحتوي على: استقبال طلبات العضوية، OCR للبطاقة،
// الخلفيات الإلكترونية المتحركة، الرسوم التكنولوجية
// آخر تحديث: 2026-06-18
// ============================================================

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ----------------------------------------------------------
// المكونات
// ----------------------------------------------------------
import { ApplicationForm } from '@/components/applications/ApplicationForm';
import { OCRProcessor } from '@/components/applications/OCRProcessor';
import { HolographicCard } from '@/components/ui/HolographicCard';
import { GlitchText } from '@/components/ui/GlitchText';
import { CyberBorder } from '@/components/ui/CyberBorder';
import { NeuralNetwork } from '@/components/ui/NeuralNetwork';
import { MatrixRain } from '@/components/ui/MatrixRain';

// ----------------------------------------------------------
// الأيقونات
// ----------------------------------------------------------
import {
  HiShieldCheck,
  HiIdentification,
  HiDocumentText,
  HiArrowRight,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
} from 'react-icons/hi2';
import {
  MdFingerprint,
  MdQrCodeScanner,
  MdCloudUpload,
  MdSecurity,
} from 'react-icons/md';
import {
  RiCpuLine,
  RiCircuitLine,
  RiShieldKeyholeLine,
} from 'react-icons/ri';

// ----------------------------------------------------------
// المكتبات
// ----------------------------------------------------------
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/useAuth';

// ============================================================
// أنواع البيانات
// ============================================================
type ApplicationStep = 'welcome' | 'form' | 'ocr' | 'review' | 'confirmation';

interface StepIndicator {
  id: ApplicationStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

// ============================================================
// خطوات التقديم
// ============================================================
const APPLICATION_STEPS: StepIndicator[] = [
  {
    id: 'welcome',
    label: 'البداية',
    icon: HiShieldCheck,
    description: 'مرحباً بك في نقابتك',
  },
  {
    id: 'form',
    label: 'البيانات',
    icon: HiIdentification,
    description: 'أدخل بياناتك الأساسية',
  },
  {
    id: 'ocr',
    label: 'توثيق',
    icon: MdQrCodeScanner,
    description: 'ارفع بطاقتك الشخصية',
  },
  {
    id: 'review',
    label: 'مراجعة',
    icon: HiDocumentText,
    description: 'راجع بياناتك قبل الإرسال',
  },
  {
    id: 'confirmation',
    label: 'تأكيد',
    icon: HiCheckCircle,
    description: 'تم استلام طلبك',
  },
];

// ============================================================
// المكون الرئيسي
// ============================================================
export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  
  // ----------------------------------------------------------
  // الحالة
  // ----------------------------------------------------------
  const [currentStep, setCurrentStep] = useState<ApplicationStep>('welcome');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [ocrData, setOcrData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // ----------------------------------------------------------
  // المراجع
  // ----------------------------------------------------------
  const formRef = useRef<HTMLDivElement>(null);
  
  // ----------------------------------------------------------
  // إذا كان المستخدم مسجل دخول، انتقل للوحة التحكم
  // ----------------------------------------------------------
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);
  
  // ----------------------------------------------------------
  // الانتقال للخطوة التالية
  // ----------------------------------------------------------
  const goToNextStep = useCallback((nextStep: ApplicationStep) => {
    setCurrentStep(nextStep);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  
  // ----------------------------------------------------------
  // حفظ بيانات النموذج
  // ----------------------------------------------------------
  const handleFormComplete = useCallback((data: any) => {
    setApplicationData(data);
    goToNextStep('ocr');
  }, [goToNextStep]);
  
  // ----------------------------------------------------------
  // حفظ بيانات OCR
  // ----------------------------------------------------------
  const handleOCRComplete = useCallback((data: any) => {
    setOcrData(data);
    goToNextStep('review');
  }, [goToNextStep]);
  
  // ----------------------------------------------------------
  // تقديم الطلب النهائي
  // ----------------------------------------------------------
  const handleSubmitApplication = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const finalData = {
        ...applicationData,
        ...ocrData,
        submittedAt: new Date().toISOString(),
      };
      
      // إرسال إلى Firebase
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Protection': '1',
        },
        body: JSON.stringify(finalData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'حدث خطأ أثناء تقديم الطلب');
      }
      
      const result = await response.json();
      setSubmissionId(result.applicationId);
      goToNextStep('confirmation');
      
      toast.success('تم استلام طلبك بنجاح!');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ غير متوقع');
      toast.error(err.message || 'حدث خطأ أثناء تقديم الطلب');
    } finally {
      setIsSubmitting(false);
    }
  }, [applicationData, ocrData, goToNextStep]);
  
  // ----------------------------------------------------------
  // عرض حالة التحميل
  // ----------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-cyber-blue border-t-transparent"
          />
          <p className="text-neutral-400 font-arabic">جاري التحميل...</p>
        </div>
      </div>
    );
  }
  
  // ----------------------------------------------------------
  // إذا كان المستخدم مسجل دخول (لن يرى هذه الصفحة)
  // ----------------------------------------------------------
  if (user) {
    return null;
  }
  
  // ============================================================
  // العرض الرئيسي
  // ============================================================
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ================================================== */}
      {/* الخلفيات الإلكترونية */}
      {/* ================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        {/* شبكة عصبية في الخلف */}
        <NeuralNetwork
          nodeCount={30}
          connectionDistance={150}
          colors={['rgba(0, 240, 255, 0.08)', 'rgba(184, 0, 255, 0.05)']}
          animated={true}
        />
        
        {/* تأثير الماتريكس الخفيف */}
        <MatrixRain
          density="low"
          speed="slow"
          characters="01"
          color="rgba(0, 240, 255, 0.03)"
          fontSize={14}
        />
      </div>
      
      {/* ================================================== */}
      {/* المحتوى الرئيسي */}
      {/* ================================================== */}
      <div className="relative z-10">
        {/* ---------------------------------------------- */}
        {/* الهيدر */}
        {/* ---------------------------------------------- */}
        <header className="fixed top-0 left-0 right-0 z-50">
          <div className="backdrop-blur-xl bg-neutral-950/80 border-b border-cyber-blue/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                {/* الشعار */}
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10">
                    <Image
                      src="https://res.cloudinary.com/itwmembers/image/upload/v1/itwsmembers/syndicate/logo"
                      alt="شعار النقابة"
                      width={40}
                      height={40}
                      className="object-contain"
                      priority
                      data-watermark="true"
                    />
                    <div className="absolute inset-0 rounded-full border border-cyber-blue/30 animate-pulse-slow" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold text-white font-arabic">
                      نقابة تكنولوجيا المعلومات والبرمجيات
                    </h1>
                    <p className="text-xs text-cyber-blue font-mono">ITWS</p>
                  </div>
                </div>
                
                {/* زر الدخول */}
                <button
                  onClick={() => router.push('/login')}
                  className="
                    px-4 py-2
                    text-sm font-medium font-arabic
                    text-cyber-blue
                    border border-cyber-blue/30
                    rounded-lg
                    hover:bg-cyber-blue/10
                    hover:border-cyber-blue/50
                    transition-all duration-300
                    flex items-center gap-2
                  "
                >
                  <MdSecurity className="w-4 h-4" />
                  دخول الأعضاء
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* ---------------------------------------------- */}
        {/* المحتوى */}
        {/* ---------------------------------------------- */}
        <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8" ref={formRef}>
          <div className="max-w-4xl mx-auto">
            
            {/* ========================================== */}
            {/* شريط الخطوات */}
            {/* ========================================== */}
            <div className="mb-12">
              <div className="flex items-center justify-between">
                {APPLICATION_STEPS.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = currentStep === step.id;
                  const isCompleted = APPLICATION_STEPS.findIndex(s => s.id === currentStep) > index;
                  
                  return (
                    <div key={step.id} className="flex items-center">
                      {/* الدائرة */}
                      <div className="flex flex-col items-center">
                        <motion.div
                          className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
                            isActive && 'border-cyber-blue bg-cyber-blue/10 shadow-neon-blue',
                            isCompleted && 'border-cyber-green bg-cyber-green/10',
                            !isActive && !isCompleted && 'border-neutral-700 bg-neutral-800/50'
                          )}
                          whileHover={{ scale: 1.1 }}
                        >
                          <Icon
                            className={cn(
                              'w-5 h-5',
                              isActive && 'text-cyber-blue',
                              isCompleted && 'text-cyber-green',
                              !isActive && !isCompleted && 'text-neutral-500'
                            )}
                          />
                        </motion.div>
                        <span
                          className={cn(
                            'text-xs mt-2 font-arabic hidden sm:block',
                            isActive && 'text-cyber-blue',
                            isCompleted && 'text-cyber-green',
                            !isActive && !isCompleted && 'text-neutral-600'
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                      
                      {/* الخط الفاصل */}
                      {index < APPLICATION_STEPS.length - 1 && (
                        <div className="flex-1 mx-2 sm:mx-4">
                          <div
                            className={cn(
                              'h-0.5 rounded-full transition-all duration-500',
                              isCompleted ? 'bg-cyber-green' : 'bg-neutral-800'
                            )}
                          >
                            {isCompleted && (
                              <motion.div
                                className="h-full bg-cyber-green rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            
            {/* ========================================== */}
            {/* محتوى الخطوة الحالية */}
            {/* ========================================== */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* -------------------------------------- */}
                {/* خطوة 1: الترحيب */}
                {/* -------------------------------------- */}
                {currentStep === 'welcome' && (
                  <WelcomeStep onStart={() => goToNextStep('form')} />
                )}
                
                {/* -------------------------------------- */}
                {/* خطوة 2: النموذج */}
                {/* -------------------------------------- */}
                {currentStep === 'form' && (
                  <ApplicationForm
                    onComplete={handleFormComplete}
                    onBack={() => goToNextStep('welcome')}
                  />
                )}
                
                {/* -------------------------------------- */}
                {/* خطوة 3: OCR */}
                {/* -------------------------------------- */}
                {currentStep === 'ocr' && (
                  <OCRProcessor
                    onComplete={handleOCRComplete}
                    onBack={() => goToNextStep('form')}
                  />
                )}
                
                {/* -------------------------------------- */}
                {/* خطوة 4: المراجعة */}
                {/* -------------------------------------- */}
                {currentStep === 'review' && (
                  <ReviewStep
                    data={{ ...applicationData, ...ocrData }}
                    onSubmit={handleSubmitApplication}
                    onBack={() => goToNextStep('ocr')}
                    isSubmitting={isSubmitting}
                    error={error}
                  />
                )}
                
                {/* -------------------------------------- */}
                {/* خطوة 5: التأكيد */}
                {/* -------------------------------------- */}
                {currentStep === 'confirmation' && (
                  <ConfirmationStep
                    applicationId={submissionId}
                    onTrack={() => router.push('/track')}
                  />
                )}
              </motion.div>
            </AnimatePresence>
            
          </div>
        </div>
        
        {/* ---------------------------------------------- */}
        {/* الفوتر */}
        {/* ---------------------------------------------- */}
        <footer className="fixed bottom-0 left-0 right-0 z-40">
          <div className="backdrop-blur-xl bg-neutral-950/80 border-t border-cyber-blue/10">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between text-xs text-neutral-500 font-mono">
              <span>© {new Date().getFullYear()} ITWS - جميع الحقوق محفوظة</span>
              <span className="flex items-center gap-1">
                <RiShieldKeyholeLine className="w-3 h-3 text-cyber-blue" />
                اتصال آمن مشفر
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ============================================================
// مكون خطوة الترحيب
// ============================================================
function WelcomeStep({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 mx-auto mb-8 relative"
      >
        <div className="absolute inset-0 rounded-full border-2 border-cyber-blue/30 animate-pulse-ring" />
        <div className="absolute inset-2 rounded-full border border-cyber-purple/20 animate-cyber-rotate" />
        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 backdrop-blur-sm border border-cyber-blue/40 flex items-center justify-center">
          <RiCpuLine className="w-12 h-12 text-cyber-blue" />
        </div>
      </motion.div>
      
      <GlitchText
        text="مرحباً بك في نقابتك"
        className="text-3xl sm:text-4xl font-bold mb-4 font-arabic"
      />
      
      <p className="text-neutral-400 max-w-lg mx-auto mb-8 font-arabic leading-relaxed">
        نظام التقديم الذكي لعضوية نقابة تكنولوجيا المعلومات والبرمجيات.
        قم بتصوير بطاقتك الشخصية وسيقوم النظام بقراءة بياناتك تلقائياً.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
        {[
          { icon: MdFingerprint, title: 'تحقق ذكي', desc: 'OCR لبطاقتك الشخصية' },
          { icon: MdCloudUpload, title: 'رفع آمن', desc: 'تشفير كامل لبياناتك' },
          { icon: HiClock, title: 'متابعة فورية', desc: 'تتبع طلبك برقمه' },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 * index }}
            className="glass-panel-sm p-4 text-center"
          >
            <item.icon className="w-8 h-8 text-cyber-blue mx-auto mb-2" />
            <h3 className="text-white font-medium text-sm mb-1 font-arabic">{item.title}</h3>
            <p className="text-neutral-500 text-xs font-arabic">{item.desc}</p>
          </motion.div>
        ))}
      </div>
      
      <button
        onClick={onStart}
        className="btn-cyber text-lg px-10 py-4 font-arabic"
      >
        ابدأ طلب العضوية
        <HiArrowRight className="inline-block w-5 h-5 mr-2" />
      </button>
    </div>
  );
}

// ============================================================
// مكون خطوة المراجعة
// ============================================================
function ReviewStep({
  data,
  onSubmit,
  onBack,
  isSubmitting,
  error,
}: {
  data: any;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  error: string | null;
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white font-arabic text-center mb-8">
        مراجعة بيانات الطلب
      </h2>
      
      <HolographicCard className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'الاسم الكامل', value: data.fullName },
            { label: 'الرقم القومي', value: data.nationalId },
            { label: 'تاريخ الميلاد', value: data.birthDate },
            { label: 'المحافظة', value: data.governorate },
            { label: 'البريد الإلكتروني', value: data.email },
            { label: 'رقم الهاتف', value: data.phone },
            { label: 'المؤهل الدراسي', value: data.education },
            { label: 'التخصص', value: data.specialization },
          ].map((item, index) => (
            <div key={index} className="flex flex-col gap-1">
              <span className="text-neutral-500 text-xs font-arabic">{item.label}</span>
              <span className="text-white font-medium font-arabic">{item.value || 'غير محدد'}</span>
            </div>
          ))}
        </div>
      </HolographicCard>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-danger/10 border border-danger/30 rounded-lg p-4 flex items-center gap-3"
        >
          <HiExclamationCircle className="w-5 h-5 text-danger flex-shrink-0" />
          <p className="text-danger text-sm font-arabic">{error}</p>
        </motion.div>
      )}
      
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 text-neutral-400 hover:text-white font-arabic transition-colors disabled:opacity-50"
        >
          ← تعديل البيانات
        </button>
        
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="btn-cyber px-10 py-3 font-arabic disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              جاري الإرسال...
            </span>
          ) : (
            'تأكيد وتقديم الطلب ✓'
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================
// مكون خطوة التأكيد
// ============================================================
function ConfirmationStep({
  applicationId,
  onTrack,
}: {
  applicationId: string | null;
  onTrack: () => void;
}) {
  return (
    <div className="text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-20 h-20 mx-auto mb-6 rounded-full bg-cyber-green/10 border-2 border-cyber-green flex items-center justify-center"
      >
        <HiCheckCircle className="w-10 h-10 text-cyber-green" />
      </motion.div>
      
      <h2 className="text-2xl font-bold text-white font-arabic mb-4">
        تم استلام طلبك بنجاح!
      </h2>
      
      <p className="text-neutral-400 font-arabic mb-2">
        رقم الطلب الخاص بك:
      </p>
      
      <CyberBorder className="inline-block px-8 py-3 mb-6">
        <span className="text-2xl font-mono text-cyber-blue font-bold tracking-wider">
          {applicationId || 'جاري التوليد...'}
        </span>
      </CyberBorder>
      
      <p className="text-neutral-500 text-sm font-arabic mb-8 max-w-md mx-auto">
        سيتم مراجعة طلبك خلال 24-48 ساعة. يمكنك متابعة حالة طلبك باستخدام رقم الطلب والرقم القومي.
      </p>
      
      <button onClick={onTrack} className="btn-cyber px-8 py-3 font-arabic">
        متابعة الطلب
        <HiArrowRight className="inline-block w-5 h-5 mr-2" />
      </button>
    </div>
  );
}
