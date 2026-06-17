// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// Middleware - الحماية المركزية والتحويل الذكي للفروع
// يعمل على مستوى Edge قبل وصول الطلب للتطبيق
// آخر تحديث: 2026-06-18
// ============================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ============================================================
// أنواع البيانات
// ============================================================
type UserRole = 'nakib' | 'branch_manager' | 'editor' | 'data_entry' | 'viewer';
type GovernorateCode = string;

interface DecodedToken {
  uid: string;
  email?: string;
  role: UserRole;
  governorates: GovernorateCode[];
  permissions: {
    canApprove: boolean;
    canReject: boolean;
    canPrint: boolean;
    canAddUsers: boolean;
    canEditStamps: boolean;
  };
  iat: number;
  exp: number;
}

// ============================================================
// تكوين المحافظات المصرية
// ============================================================
const EGYPTIAN_GOVERNORATES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
};

// ============================================================
// المسارات العامة (لا تحتاج مصادقة)
// ============================================================
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',
  '/api/public',
  '/api/health',
  '/api/ocr/webhook',
  '/404',
  '/500',
  '/maintenance',
];

// ============================================================
// المسارات الخاصة بكل دور
// ============================================================
const ROLE_ROUTES: Record<UserRole, string[]> = {
  nakib: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/members',
    '/dashboard/committees',
    '/dashboard/payments',
    '/dashboard/stamps',
    '/dashboard/users',
    '/dashboard/reports',
    '/dashboard/settings',
    '/dashboard/logs',
    '/api/applications',
    '/api/members',
    '/api/committees',
    '/api/payments',
    '/api/users',
    '/api/stamps',
    '/api/reports',
    '/api/logs',
    '/api/settings',
  ],
  branch_manager: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/members',
    '/dashboard/payments',
    '/dashboard/reports',
    '/dashboard/settings',
    '/api/applications',
    '/api/members',
    '/api/payments',
    '/api/reports',
  ],
  editor: [
    '/dashboard',
    '/dashboard/applications',
    '/dashboard/members',
    '/dashboard/payments',
    '/api/applications',
    '/api/members',
    '/api/payments',
  ],
  data_entry: [
    '/dashboard',
    '/dashboard/applications',
    '/api/applications',
  ],
  viewer: [
    '/dashboard',
    '/dashboard/members',
    '/dashboard/reports',
  ],
};

// ============================================================
// تكوينات الأمان
// ============================================================
const SECURITY_CONFIG = {
  // الحد الأقصى لمحاولات الفشل قبل الحظر المؤقت
  MAX_FAILED_ATTEMPTS: 5,
  // مدة الحظر المؤقت (بالدقائق)
  BLOCK_DURATION_MINUTES: 15,
  // مدة صلاحية الجلسة (بالساعات)
  SESSION_DURATION_HOURS: 8,
  // تجديد الجلسة قبل انتهائها (بالدقائق)
  SESSION_REFRESH_BEFORE_MINUTES: 30,
  // الحد الأقصى لحجم الطلب
  MAX_REQUEST_BODY_SIZE: 10 * 1024 * 1024, // 10MB
  // الحد الأقصى لعدد الطلبات في الدقيقة
  RATE_LIMIT_REQUESTS: 100,
  // مدة نافذة التحديد (بالثواني)
  RATE_LIMIT_WINDOW_SECONDS: 60,
};

// ============================================================
// دوال مساعدة
// ============================================================

/**
 * استخراج IP العميل من الطلب
 */
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return '127.0.0.1';
}

/**
 * استخراج User Agent
 */
function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

/**
 * التحقق من صحة التوكين (محاكاة - في الإنتاج تستخدم Firebase Admin)
 */
async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    // في الإنتاج: استخدم Firebase Admin SDK للتحقق
    // const decodedToken = await admin.auth().verifyIdToken(token);
    
    // للتوضيح: فك تشفير التوكين (يجب استبداله بالتحقق الحقيقي)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // التحقق من صلاحية التوكين
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }
    
    return payload as DecodedToken;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * التحقق من صلاحية الوصول للدور
 */
function hasAccess(role: UserRole, path: string): boolean {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(route => path.startsWith(route));
}

/**
 * التحقق من صلاحية الوصول للمحافظة
 */
function hasGovernorateAccess(user: DecodedToken, governorate: string): boolean {
  // النقيب يرى كل المحافظات
  if (user.role === 'nakib') {
    return true;
  }
  // الأدوار الأخرى ترى محافظاتها المخصصة فقط
  return user.governorates.includes(governorate);
}

/**
 * استخراج رمز المحافظة من المسار أو الهيدر
 */
function extractGovernorate(request: NextRequest): string | null {
  // محاولة استخراج المحافظة من المسار
  const url = new URL(request.url);
  const governorateParam = url.searchParams.get('governorate');
  if (governorateParam) {
    return governorateParam;
  }
  
  // محاولة استخراج المحافظة من هيدر مخصص
  const governorateHeader = request.headers.get('x-governorate');
  if (governorateHeader) {
    return governorateHeader;
  }
  
  return null;
}

/**
 * تسجيل محاولة الوصول
 */
async function logAccessAttempt(
  ip: string,
  userAgent: string,
  path: string,
  userId: string | null,
  success: boolean,
  reason: string
): Promise<void> {
  const logEntry = {
    timestamp: new Date().toISOString(),
    ip,
    userAgent,
    path,
    userId,
    success,
    reason,
  };
  
  // في الإنتاج: أرسل إلى Firebase Firestore أو سجل المراقبة
  console.log('[Middleware Access Log]', JSON.stringify(logEntry));
}

/**
 * إنشاء استجابة خطأ
 */
function createErrorResponse(
  status: number,
  message: string,
  code: string,
  request: NextRequest
): NextResponse {
  const response = NextResponse.json(
    {
      error: true,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: request.nextUrl.pathname,
    },
    { status }
  );
  
  // إضافة هيدرات أمان
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  return response;
}

// ============================================================
// دالة Middleware الرئيسية
// ============================================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const startTime = Date.now();
  
  // ----------------------------------------------------------
  // 1. تسجيل بداية الطلب
  // ----------------------------------------------------------
  console.log(`[${new Date().toISOString()}] ${request.method} ${pathname} - ${ip}`);
  
  // ----------------------------------------------------------
  // 2. التحقق من المسارات العامة
  // ----------------------------------------------------------
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    // إضافة هيدرات أمان حتى للمسارات العامة
    const response = NextResponse.next();
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    return response;
  }
  
  // ----------------------------------------------------------
  // 3. حظر المسارات الحساسة
  // ----------------------------------------------------------
  const blockedPaths = [
    '/.env',
    '/.env.local',
    '/.env.production',
    '/.git',
    '/node_modules',
    '/package.json',
    '/yarn.lock',
    '/next.config.js',
    '/wp-admin',
    '/admin',
    '/administrator',
  ];
  
  if (blockedPaths.some(p => pathname.toLowerCase().includes(p.toLowerCase()))) {
    await logAccessAttempt(ip, userAgent, pathname, null, false, 'blocked_sensitive_path');
    return createErrorResponse(403, 'الوصول إلى هذا المسار ممنوع', 'FORBIDDEN_PATH', request);
  }
  
  // ----------------------------------------------------------
  // 4. التحقق من حجم الطلب
  // ----------------------------------------------------------
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > SECURITY_CONFIG.MAX_REQUEST_BODY_SIZE) {
    return createErrorResponse(413, 'حجم الطلب كبير جداً', 'PAYLOAD_TOO_LARGE', request);
  }
  
  // ----------------------------------------------------------
  // 5. استخراج التوكين
  // ----------------------------------------------------------
  const authHeader = request.headers.get('authorization');
  const cookieToken = request.cookies.get('itws_session')?.value;
  
  let token: string | null = null;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (cookieToken) {
    token = cookieToken;
  }
  
  // ----------------------------------------------------------
  // 6. إذا لم يكن هناك توكين - إعادة توجيه لصفحة الدخول
  // ----------------------------------------------------------
  if (!token) {
    await logAccessAttempt(ip, userAgent, pathname, null, false, 'no_token');
    
    // إذا كان الطلب API
    if (pathname.startsWith('/api/')) {
      return createErrorResponse(401, 'يجب تسجيل الدخول أولاً', 'UNAUTHORIZED', request);
    }
    
    // إعادة توجيه لصفحة الدخول مع حفظ المسار المطلوب
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // ----------------------------------------------------------
  // 7. التحقق من صحة التوكين
  // ----------------------------------------------------------
  const decodedToken = await verifyToken(token);
  
  if (!decodedToken) {
    await logAccessAttempt(ip, userAgent, pathname, null, false, 'invalid_token');
    
    const response = createErrorResponse(401, 'انتهت الجلسة - الرجاء إعادة الدخول', 'TOKEN_EXPIRED', request);
    response.cookies.delete('itws_session');
    return response;
  }
  
  // ----------------------------------------------------------
  // 8. التحقق من صلاحية الدور للمسار
  // ----------------------------------------------------------
  if (!hasAccess(decodedToken.role, pathname)) {
    await logAccessAttempt(ip, userAgent, pathname, decodedToken.uid, false, 'insufficient_permissions');
    return createErrorResponse(403, 'ليس لديك صلاحية للوصول', 'FORBIDDEN', request);
  }
  
  // ----------------------------------------------------------
  // 9. التحقق من صلاحية المحافظة (للأدوار غير النقيب)
  // ----------------------------------------------------------
  if (decodedToken.role !== 'nakib') {
    const governorate = extractGovernorate(request);
    
    if (governorate && !hasGovernorateAccess(decodedToken, governorate)) {
      await logAccessAttempt(ip, userAgent, pathname, decodedToken.uid, false, 'wrong_governorate');
      return createErrorResponse(403, 'ليس لديك صلاحية لهذه المحافظة', 'WRONG_GOVERNORATE', request);
    }
  }
  
  // ----------------------------------------------------------
  // 10. تجديد الجلسة إذا قاربت على الانتهاء
  // ----------------------------------------------------------
  const response = NextResponse.next();
  
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresIn = decodedToken.exp - nowInSeconds;
  const refreshThreshold = SECURITY_CONFIG.SESSION_REFRESH_BEFORE_MINUTES * 60;
  
  if (expiresIn < refreshThreshold) {
    // تجديد التوكين (في الإنتاج: استخدم Firebase Auth refresh)
    response.headers.set('x-session-refresh', 'true');
  }
  
  // ----------------------------------------------------------
  // 11. إضافة هيدرات المستخدم للاستخدام في التطبيق
  // ----------------------------------------------------------
  response.headers.set('x-user-id', decodedToken.uid);
  response.headers.set('x-user-role', decodedToken.role);
  response.headers.set('x-user-governorates', decodedToken.governorates.join(','));
  
  // ----------------------------------------------------------
  // 12. إضافة هيدرات الأمان
  // ----------------------------------------------------------
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');
  
  // إضافة هيدر مخصص لتتبع وقت المعالجة
  const processingTime = Date.now() - startTime;
  response.headers.set('x-response-time', `${processingTime}ms`);
  
  // ----------------------------------------------------------
  // 13. تسجيل نجاح الوصول
  // ----------------------------------------------------------
  await logAccessAttempt(ip, userAgent, pathname, decodedToken.uid, true, 'success');
  
  return response;
}

// ============================================================
// تكوين المسارات التي يعمل عليها Middleware
// ============================================================
export const config = {
  matcher: [
    /*
     * طابق جميع المسارات ما عدا:
     * - الملفات الثابتة (static files)
     * - ملفات الوسائط (media files)
     * - ملفات Next.js الداخلية
     * - ملفات التحليلات
     */
    '/((?!_next/static|_next/image|favicon.ico|images/|fonts/|api/health|api/ocr/webhook).*)',
  ],
};

// ============================================================
// تصدير الدوال المساعدة للاستخدام في أجزاء أخرى من التطبيق
// ============================================================
export {
  EGYPTIAN_GOVERNORATES,
  SECURITY_CONFIG,
  PUBLIC_ROUTES,
  ROLE_ROUTES,
  verifyToken,
  hasAccess,
  hasGovernorateAccess,
  extractGovernorate,
  getClientIP,
};

export type { UserRole, GovernorateCode, DecodedToken };
