// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// لوحة التحكم الرئيسية - Dashboard
// خاصة بـ: النقيب العام، مدراء الفروع، الإداريين
// تحتوي على: إحصائيات حية، رسوم بيانية، تنبيهات، نشاطات
// آخر تحديث: 2026-06-18
// ============================================================

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// ----------------------------------------------------------
// المكونات الأساسية
// ----------------------------------------------------------
import { NakibDashboard } from '@/components/dashboard/NakibDashboard';
import { BranchManagerDashboard } from '@/components/dashboard/BranchManagerDashboard';
import { EditorDashboard } from '@/components/dashboard/EditorDashboard';
import { DataEntryDashboard } from '@/components/dashboard/DataEntryDashboard';
import { ViewerDashboard } from '@/components/dashboard/ViewerDashboard';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { RecentApplications } from '@/components/dashboard/RecentApplications';
import { GovernorateMap } from '@/components/dashboard/GovernorateMap';
import { CommitteeDistribution } from '@/components/dashboard/CommitteeDistribution';
import { PaymentChart } from '@/components/dashboard/PaymentChart';
import { AlertsPanel } from '@/components/dashboard/AlertsPanel';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { HolographicCard } from '@/components/ui/HolographicCard';
import { GlitchText } from '@/components/ui/GlitchText';
import { CyberBorder } from '@/components/ui/CyberBorder';

// ----------------------------------------------------------
// المكونات المحملة ديناميكياً (للأداء)
// ----------------------------------------------------------
const DynamicChart = dynamic(() => import('@/components/dashboard/DynamicChart'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const DynamicMap = dynamic(() => import('@/components/dashboard/DynamicMap'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

// ----------------------------------------------------------
// الأيقونات
// ----------------------------------------------------------
import {
  HiUsers,
  HiDocumentText,
  HiCurrencyDollar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiUserGroup,
  HiBuildingOffice,
  HiShieldCheck,
  HiBellAlert,
  HiMagnifyingGlass,
  HiPlus,
  HiPrinter,
  HiEnvelope,
  HiPhone,
  HiChartBar,
  HiChartPie,
  HiMap,
  HiCalendarDays,
} from 'react-icons/hi2';
import {
  MdOutlineQrCodeScanner,
  MdFingerprint,
  MdSecurity,
  MdCloudDone,
  MdSpeed,
  MdStorage,
} from 'react-icons/md';
import {
  RiCpuLine,
  RiDashboardLine,
  RiBarChartBoxLine,
  RiFileListLine,
  RiTeamLine,
  RiBankLine,
  RiSettingsLine,
} from 'react-icons/ri';

// ----------------------------------------------------------
// المكتبات
// ----------------------------------------------------------
import { useAuth } from '@/lib/auth/useAuth';
import { usePermissions } from '@/lib/auth/Permissions';
import { cn } from '@/lib/utils';
import { formatDate, formatNumber, formatCurrency } from '@/lib/formatters';
import type { UserRole } from '@/middleware';

// ============================================================
// أنواع البيانات
// ============================================================
interface DashboardStats {
  totalMembers: number;
  newApplications: number;
  pendingApplications: number;
  approvedToday: number;
  rejectedToday: number;
  totalPayments: number;
  activeSubscriptions: number;
  expiringSubscriptions: number;
  committeesCount: number;
  branchesCount: number;
  usersCount: number;
  fraudAlerts: number;
  averageProcessingTime: number; // بالساعات
}

interface GovernorateStats {
  code: string;
  name: string;
  totalMembers: number;
  newApplications: number;
  percentage: number;
}

interface CommitteeStats {
  id: string;
  name: string;
  membersCount: number;
  color: string;
}

interface PaymentStats {
  date: string;
  amount: number;
  count: number;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  role: string;
  target: string;
  timestamp: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

interface RecentApplication {
  id: string;
  applicantName: string;
  governorate: string;
  specialization: string;
  status: 'pending' | 'under_review' | 'needs_correction' | 'accepted' | 'rejected';
  submittedAt: string;
}

// ============================================================
// المكون الرئيسي
// ============================================================
export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { permissions, role, governorates } = usePermissions();
  
  // ----------------------------------------------------------
  // الحالة
  // ----------------------------------------------------------
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [governorateStats, setGovernorateStats] = useState<GovernorateStats[]>([]);
  const [committeeStats, setCommitteeStats] = useState<CommitteeStats[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  
  // ----------------------------------------------------------
  // جلب البيانات من Firebase
  // ----------------------------------------------------------
  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        period: selectedPeriod,
        governorate: governorates?.join(',') || '',
        role: role || '',
      });
      
      const response = await fetch(`/api/dashboard?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('فشل جلب بيانات لوحة التحكم');
      }
      
      const data = await response.json();
      
      setStats(data.stats);
      setGovernorateStats(data.governorateStats || []);
      setCommitteeStats(data.committeeStats || []);
      setPaymentStats(data.paymentStats || []);
      setRecentActivities(data.recentActivities || []);
      setRecentApplications(data.recentApplications || []);
      
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'حدث خطأ أثناء جلب البيانات');
      toast.error('فشل تحميل بيانات لوحة التحكم');
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedPeriod, governorates, role]);
  
  // ----------------------------------------------------------
  // جلب البيانات عند التحميل
  // ----------------------------------------------------------
  useEffect(() => {
    fetchDashboardData();
    
    // تحديث كل 30 ثانية
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);
  
  // ----------------------------------------------------------
  // معالجات الأحداث
  // ----------------------------------------------------------
  const handleRefresh = useCallback(() => {
    fetchDashboardData();
    toast.success('تم تحديث البيانات');
  }, [fetchDashboardData]);
  
  const handleNewApplication = useCallback(() => {
    router.push('/dashboard/applications/new');
  }, [router]);
  
  const handleSearch = useCallback((query: string) => {
    router.push(`/dashboard/search?q=${encodeURIComponent(query)}`);
  }, [router]);
  
  // ----------------------------------------------------------
  // حالة التحميل
  // ----------------------------------------------------------
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" message="جاري تحميل لوحة التحكم..." />
      </div>
    );
  }
  
  // ----------------------------------------------------------
  // إذا لم يكن مصرحاً
  // ----------------------------------------------------------
  if (!user) {
    router.push('/login');
    return null;
  }
  
  // ----------------------------------------------------------
  // اختيار لوحة التحكم المناسبة حسب الدور
  // ----------------------------------------------------------
  const renderDashboardByRole = () => {
    switch (role) {
      case 'nakib':
        return (
          <NakibDashboard
            stats={stats}
            governorateStats={governorateStats}
            committeeStats={committeeStats}
            paymentStats={paymentStats}
            recentActivities={recentActivities}
            recentApplications={recentApplications}
            onRefresh={handleRefresh}
          />
        );
      case 'branch_manager':
        return (
          <BranchManagerDashboard
            stats={stats}
            governorateStats={governorateStats}
            paymentStats={paymentStats}
            recentApplications={recentApplications}
            onRefresh={handleRefresh}
          />
        );
      case 'editor':
        return (
          <EditorDashboard
            stats={stats}
            recentApplications={recentApplications}
            onRefresh={handleRefresh}
          />
        );
      case 'data_entry':
        return (
          <DataEntryDashboard
            stats={stats}
            recentApplications={recentApplications}
            onRefresh={handleRefresh}
          />
        );
      case 'viewer':
        return (
          <ViewerDashboard
            stats={stats}
            governorateStats={governorateStats}
            committeeStats={committeeStats}
          />
        );
      default:
        return (
          <div className="text-center py-20">
            <HiExclamationTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <p className="text-neutral-400 font-arabic">غير مصرح لك بالوصول</p>
          </div>
        );
    }
  };
  
  // ============================================================
  // العرض الرئيسي
  // ============================================================
  return (
    <div className="min-h-screen pb-16">
      {/* ================================================== */}
      {/* هيدر لوحة التحكم */}
      {/* ================================================== */}
      <header className="sticky top-16 z-40 backdrop-blur-xl bg-neutral-950/80 border-b border-cyber-blue/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* العنوان */}
            <div className="flex items-center gap-3">
              <RiDashboardLine className="w-5 h-5 text-cyber-blue" />
              <h1 className="text-lg font-bold text-white font-arabic">
                لوحة التحكم
              </h1>
              {stats && (
                <span className="text-xs text-neutral-500 font-mono">
                  آخر تحديث: {formatDate(new Date().toISOString(), 'time')}
                </span>
              )}
            </div>
            
            {/* الأدوات */}
            <div className="flex items-center gap-2">
              {/* فلتر الفترة */}
              <div className="flex items-center bg-neutral-800/50 rounded-lg border border-neutral-700/50 p-0.5">
                {(['today', 'week', 'month', 'year'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-arabic rounded-md transition-all duration-200',
                      selectedPeriod === period
                        ? 'bg-cyber-blue/20 text-cyber-blue'
                        : 'text-neutral-400 hover:text-white'
                    )}
                  >
                    {period === 'today' && 'اليوم'}
                    {period === 'week' && 'أسبوع'}
                    {period === 'month' && 'شهر'}
                    {period === 'year' && 'سنة'}
                  </button>
                ))}
              </div>
              
              {/* زر التحديث */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
                title="تحديث البيانات"
              >
                <motion.div
                  animate={isLoading ? { rotate: 360 } : {}}
                  transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: 'linear' }}
                >
                  <MdSpeed className="w-5 h-5" />
                </motion.div>
              </button>
              
              {/* زر إضافة جديد (للنقيب والمحرر) */}
              {(role === 'nakib' || role === 'editor' || role === 'data_entry') && (
                <button
                  onClick={handleNewApplication}
                  className="btn-cyber px-3 py-1.5 text-sm font-arabic flex items-center gap-1"
                >
                  <HiPlus className="w-4 h-4" />
                  طلب جديد
                </button>
              )}
            </div>
          </div>
        </div>
      </header>
      
      {/* ================================================== */}
      {/* المحتوى */}
      {/* ================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-32"
            >
              <LoadingSpinner size="lg" message="جاري تحميل البيانات من الخادم..." />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-20"
            >
              <HiExclamationTriangle className="w-16 h-16 text-danger mx-auto mb-4" />
              <p className="text-danger font-arabic mb-4">{error}</p>
              <button onClick={handleRefresh} className="btn-cyber px-6 py-2 font-arabic">
                إعادة المحاولة
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* عرض لوحة التحكم حسب الدور */}
              {renderDashboardByRole()}
              
              {/* ========================================== */}
              {/* قسم النشاطات الحديثة (للجميع) */}
              {/* ========================================== */}
              {recentActivities.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold text-white font-arabic mb-4 flex items-center gap-2">
                    <HiClock className="w-5 h-5 text-cyber-blue" />
                    النشاطات الحديثة
                  </h2>
                  <ActivityFeed activities={recentActivities} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================
// مكون بطاقة الإحصائية
// ============================================================
export function StatsCardComponent({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'cyber-blue',
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'glass-panel-sm p-5 cursor-pointer transition-all duration-300',
        'hover:border-cyber-blue/30 hover:shadow-neon-blue'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          `bg-${color}/10 border border-${color}/20`
        )}>
          <Icon className={cn('w-5 h-5', `text-${color}`)} />
        </div>
        
        {trend && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-mono px-2 py-1 rounded-full',
            trend === 'up' && 'bg-success/10 text-success',
            trend === 'down' && 'bg-danger/10 text-danger',
            trend === 'neutral' && 'bg-neutral-800 text-neutral-400'
          )}>
            {trend === 'up' && <HiArrowTrendingUp className="w-3 h-3" />}
            {trend === 'down' && <HiArrowTrendingDown className="w-3 h-3" />}
            {trendValue && <span>{trendValue}</span>}
          </div>
        )}
      </div>
      
      <p className="text-2xl sm:text-3xl font-bold text-white font-mono mb-1">
        {typeof value === 'number' ? formatNumber(value) : value}
      </p>
      
      <p className="text-sm text-neutral-400 font-arabic">{title}</p>
    </motion.div>
  );
}
