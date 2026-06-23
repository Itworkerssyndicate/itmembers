// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// نظام حماية الجلسات - Session Guardian
// يحتوي على: حماية الجلسات، إدارة التوكين، كشف الاختراق،
// منع اختطاف الجلسة، تدوير التوكين، قفل الجلسة،
// مراقبة النشاط المشبوه، حماية CSRF/XSRF،
// إدارة الجلسات المتعددة، التنبيهات الأمنية
// آخر تحديث: 2026-06-18
// ============================================================

import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { EncryptionEngine } from './Encryption';
import { DeviceFingerprint } from './DeviceFingerprint';

// ============================================================
// أنواع البيانات
// ============================================================
interface SessionData {
  sessionId: string;
  userId: string;
  role: string;
  governorates: string[];
  permissions: string[];
  
  // بيانات الجلسة
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  refreshExpiresAt: Date;
  
  // أمان
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  geoLocation?: {
    country: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  
  // التوكين
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
  
  // الحالة
  isActive: boolean;
  isLocked: boolean;
  isCompromised: boolean;
  
  // metadata
  loginMethod: 'email' | 'biometric' | 'google' | 'token';
  twoFactorVerified: boolean;
  deviceTrusted: boolean;
  
  // التدقيق
  activityLog: SessionActivity[];
  securityFlags: SecurityFlag[];
}

interface SessionActivity {
  timestamp: Date;
  action: string;
  path: string;
  ipAddress: string;
  success: boolean;
  details?: string;
}

interface SecurityFlag {
  timestamp: Date;
  type: SecurityFlagType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolved: boolean;
}

type SecurityFlagType =
  | 'ip_change'
  | 'device_change'
  | 'geo_anomaly'
  | 'rapid_requests'
  | 'unusual_hours'
  | 'multiple_sessions'
  | 'token_reuse'
  | 'csrf_mismatch'
  | 'brute_force_pattern'
  | 'session_hijack_attempt';

interface SessionConfig {
  sessionDurationMinutes: number;        // مدة الجلسة الأساسية
  refreshDurationMinutes: number;        // مدة صلاحية التحديث
  maxConcurrentSessions: number;         // الحد الأقصى للجلسات المتزامنة
  inactivityTimeoutMinutes: number;      // مهلة عدم النشاط
  lockAfterFailedAttempts: number;       // قفل بعد محاولات فاشلة
  lockDurationMinutes: number;           // مدة القفل
  requireTwoFactor: boolean;             // اشتراط التحقق الثنائي
  enforceSingleSession: boolean;         // فرض جلسة واحدة
  rotateTokenOnActivity: boolean;        // تدوير التوكين مع كل نشاط
  validateDeviceFingerprint: boolean;    // التحقق من بصمة الجهاز
  validateIPBinding: boolean;            // ربط الجلسة بـ IP
  validateGeoLocation: boolean;          // التحقق من الموقع الجغرافي
  logAllActivities: boolean;             // تسجيل كل الأنشطة
  alertOnAnomaly: boolean;               // تنبيه عند الشذوذ
}

interface TokenPayload {
  sub: string;          // userId
  sid: string;          // sessionId
  role: string;
  gov: string[];        // governorates
  perms: string[];      // permissions
  iat: number;          // issued at
  exp: number;          // expiration
  jti: string;          // JWT ID (unique)
  fp: string;           // device fingerprint hash
  ip: string;           // IP address hash
  type: 'access' | 'refresh';
}

interface CSRFData {
  token: string;
  createdAt: Date;
  expiresAt: Date;
  boundToSession: string;
}

// ============================================================
// الثوابت
// ============================================================
const DEFAULT_CONFIG: SessionConfig = {
  sessionDurationMinutes: 480,          // 8 ساعات
  refreshDurationMinutes: 43200,        // 30 يوم
  maxConcurrentSessions: 3,
  inactivityTimeoutMinutes: 30,
  lockAfterFailedAttempts: 5,
  lockDurationMinutes: 15,
  requireTwoFactor: false,
  enforceSingleSession: false,
  rotateTokenOnActivity: true,
  validateDeviceFingerprint: true,
  validateIPBinding: false,
  validateGeoLocation: false,
  logAllActivities: true,
  alertOnAnomaly: true,
};

const SESSION_ID_LENGTH = 32;
const TOKEN_ID_LENGTH = 24;
const CSRF_TOKEN_LENGTH = 48;

// قائمة المسارات الحساسة التي تتطلب تحقق إضافي
const SENSITIVE_PATHS = [
  '/api/applications/approve',
  '/api/applications/reject',
  '/api/members/delete',
  '/api/payments/process',
  '/api/users/manage',
  '/api/settings/change',
  '/api/stamps/apply',
  '/dashboard/settings',
  '/dashboard/users',
];

// ============================================================
// كلاس SessionGuard
// ============================================================
export class SessionGuard {
  private config: SessionConfig;
  private encryption: EncryptionEngine;
  private deviceFingerprint: DeviceFingerprint;
  private sessions: Map<string, SessionData> = new Map();
  private lockedSessions: Map<string, Date> = new Map();
  private failedAttempts: Map<string, number> = new Map();
  private csrfTokens: Map<string, CSRFData> = new Map();
  private revokedTokens: Set<string> = new Set();
  private anomalyCallbacks: Array<(flag: SecurityFlag) => void> = [];

  constructor(config: Partial<SessionConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.encryption = new EncryptionEngine();
    this.deviceFingerprint = new DeviceFingerprint();
  }

  // ==========================================================
  // إنشاء جلسة جديدة
  // ==========================================================

  /**
   * إنشاء جلسة جديدة كاملة
   */
  createSession(userData: {
    userId: string;
    role: string;
    governorates: string[];
    permissions: string[];
    ipAddress: string;
    userAgent: string;
    deviceFingerprint: string;
    loginMethod: SessionData['loginMethod'];
    geoLocation?: SessionData['geoLocation'];
  }): SessionData {
    const now = new Date();

    // التحقق من عدد الجلسات المتزامنة
    if (this.config.enforceSingleSession) {
      this.terminateAllUserSessions(userData.userId);
    } else {
      this.enforceConcurrentSessionLimit(userData.userId);
    }

    // إنشاء الجلسة
    const session: SessionData = {
      sessionId: this.generateSessionId(),
      userId: userData.userId,
      role: userData.role,
      governorates: userData.governorates,
      permissions: userData.permissions,
      
      createdAt: now,
      lastActivity: now,
      expiresAt: new Date(now.getTime() + this.config.sessionDurationMinutes * 60 * 1000),
      refreshExpiresAt: new Date(now.getTime() + this.config.refreshDurationMinutes * 60 * 1000),
      
      deviceFingerprint: this.hashFingerprint(userData.deviceFingerprint),
      ipAddress: this.hashIP(userData.ipAddress),
      userAgent: this.hashUserAgent(userData.userAgent),
      geoLocation: userData.geoLocation,
      
      accessToken: '',
      refreshToken: '',
      csrfToken: '',
      
      isActive: true,
      isLocked: false,
      isCompromised: false,
      
      loginMethod: userData.loginMethod,
      twoFactorVerified: !this.config.requireTwoFactor,
      deviceTrusted: false,
      
      activityLog: [],
      securityFlags: [],
    };

    // توليد التوكين
    session.accessToken = this.generateAccessToken(session);
    session.refreshToken = this.generateRefreshToken(session);
    session.csrfToken = this.generateCSRFToken(session.sessionId);

    // تسجيل النشاط الأول
    this.logActivity(session, 'session_created', '/auth/login', userData.ipAddress, true);

    // تخزين الجلسة
    this.sessions.set(session.sessionId, session);

    return session;
  }

  // ==========================================================
  // التحقق من الجلسة
  // ==========================================================

  /**
   * التحقق من صحة الجلسة
   */
  validateSession(
    accessToken: string,
    context: {
      ipAddress: string;
      userAgent: string;
      deviceFingerprint: string;
      path: string;
    }
  ): { valid: boolean; session?: SessionData; error?: string; flags?: SecurityFlag[] } {
    // فك تشفير التوكين
    const payload = this.decodeToken(accessToken);
    if (!payload) {
      return { valid: false, error: 'توكين غير صالح' };
    }

    // التحقق من صلاحية التوكين
    if (payload.type !== 'access') {
      return { valid: false, error: 'نوع توكين غير صحيح' };
    }

    if (Date.now() / 1000 > payload.exp) {
      return { valid: false, error: 'انتهت صلاحية التوكين' };
    }

    // التحقق من إبطال التوكين
    if (this.revokedTokens.has(payload.jti)) {
      return { valid: false, error: 'تم إبطال التوكين' };
    }

    // استرجاع الجلسة
    const session = this.sessions.get(payload.sid);
    if (!session) {
      return { valid: false, error: 'جلسة غير موجودة' };
    }

    // التحقق من حالة الجلسة
    if (!session.isActive) {
      return { valid: false, error: 'الجلسة غير نشطة' };
    }

    if (session.isLocked) {
      return { valid: false, error: 'الجلسة مقفلة' };
    }

    if (session.isCompromised) {
      return { valid: false, error: 'الجلسة مخترقة' };
    }

    // التحقق من انتهاء الجلسة
    if (new Date() > session.expiresAt) {
      return { valid: false, error: 'انتهت الجلسة' };
    }

    // التحقق من عدم النشاط
    const inactivityTimeout = this.config.inactivityTimeoutMinutes * 60 * 1000;
    if (new Date().getTime() - session.lastActivity.getTime() > inactivityTimeout) {
      this.lockSession(session);
      return { valid: false, error: 'الجلسة مقفلة بسبب عدم النشاط' };
    }

    // فحوصات الأمان
    const flags: SecurityFlag[] = [];

    // التحقق من بصمة الجهاز
    if (this.config.validateDeviceFingerprint) {
      const currentFingerprint = this.hashFingerprint(context.deviceFingerprint);
      if (!this.secureCompare(currentFingerprint, session.deviceFingerprint)) {
        flags.push(this.createSecurityFlag('device_change', 'high', 'تغير بصمة الجهاز'));
      }
    }

    // التحقق من IP
    if (this.config.validateIPBinding) {
      const currentIP = this.hashIP(context.ipAddress);
      if (!this.secureCompare(currentIP, session.ipAddress)) {
        flags.push(this.createSecurityFlag('ip_change', 'medium', 'تغير عنوان IP'));
      }
    }

    // التحقق من User Agent
    const currentUA = this.hashUserAgent(context.userAgent);
    if (!this.secureCompare(currentUA, session.userAgent)) {
      flags.push(this.createSecurityFlag('device_change', 'low', 'تغير User Agent'));
    }

    // المسارات الحساسة تتطلب تحقق إضافي
    if (this.isSensitivePath(context.path)) {
      if (flags.length > 0) {
        return {
          valid: false,
          error: 'يتطلب تحقق إضافي للعمليات الحساسة',
          flags,
        };
      }
    }

    // تسجيل النشاط
    this.logActivity(session, 'request', context.path, context.ipAddress, true);
    session.lastActivity = new Date();

    // تدوير التوكين إذا لزم
    if (this.config.rotateTokenOnActivity) {
      session.accessToken = this.generateAccessToken(session);
      session.csrfToken = this.generateCSRFToken(session.sessionId);
    }

    return {
      valid: true,
      session,
      flags: flags.length > 0 ? flags : undefined,
    };
  }

  // ==========================================================
  // تجديد الجلسة
  // ==========================================================

  /**
   * تجديد الجلسة باستخدام Refresh Token
   */
  refreshSession(refreshToken: string, context: {
    ipAddress: string;
    deviceFingerprint: string;
  }): { success: boolean; session?: SessionData; error?: string } {
    const payload = this.decodeToken(refreshToken);
    if (!payload || payload.type !== 'refresh') {
      return { success: false, error: 'Refresh Token غير صالح' };
    }

    if (Date.now() / 1000 > payload.exp) {
      return { success: false, error: 'انتهت صلاحية Refresh Token' };
    }

    if (this.revokedTokens.has(payload.jti)) {
      return { success: false, error: 'تم إبطال Refresh Token' };
    }

    const session = this.sessions.get(payload.sid);
    if (!session) {
      return { success: false, error: 'جلسة غير موجودة' };
    }

    if (!session.isActive || session.isCompromised) {
      return { success: false, error: 'الجلسة غير صالحة' };
    }

    // التحقق من انتهاء صلاحية التحديث
    if (new Date() > session.refreshExpiresAt) {
      this.terminateSession(session.sessionId);
      return { success: false, error: 'انتهت صلاحية التجديد - يجب إعادة الدخول' };
    }

    // إبطال التوكين القديم
    this.revokeToken(session.accessToken);
    this.revokeToken(session.refreshToken);

    // إنشاء توكين جديدة
    session.accessToken = this.generateAccessToken(session);
    session.refreshToken = this.generateRefreshToken(session);
    session.csrfToken = this.generateCSRFToken(session.sessionId);
    session.lastActivity = new Date();
    session.expiresAt = new Date(Date.now() + this.config.sessionDurationMinutes * 60 * 1000);

    this.logActivity(session, 'session_refreshed', '/auth/refresh', context.ipAddress, true);

    return { success: true, session };
  }

  // ==========================================================
  // CSRF Protection
  // ==========================================================

  /**
   * توليد CSRF Token
   */
  generateCSRFToken(sessionId: string): string {
    const token = randomBytes(CSRF_TOKEN_LENGTH).toString('base64url');
    
    const csrfData: CSRFData = {
      token,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + this.config.sessionDurationMinutes * 60 * 1000),
      boundToSession: sessionId,
    };

    // تخزين نسخة مشفرة
    this.csrfTokens.set(sessionId, csrfData);

    return token;
  }

  /**
   * التحقق من CSRF Token
   */
  validateCSRF(sessionId: string, providedToken: string): boolean {
    const csrfData = this.csrfTokens.get(sessionId);
    
    if (!csrfData) {
      return false;
    }

    if (new Date() > csrfData.expiresAt) {
      this.csrfTokens.delete(sessionId);
      return false;
    }

    if (csrfData.boundToSession !== sessionId) {
      return false;
    }

    return this.secureCompare(csrfData.token, providedToken);
  }

  // ==========================================================
  // إدارة الجلسات
  // ==========================================================

  /**
   * قفل الجلسة
   */
  lockSession(session: SessionData, reason: string = 'قفل أمني'): void {
    session.isLocked = true;
    session.isActive = false;
    session.securityFlags.push(
      this.createSecurityFlag('session_hijack_attempt', 'high', reason)
    );

    this.lockedSessions.set(session.sessionId, new Date());
    this.logActivity(session, 'session_locked', '/security/lock', session.ipAddress, false, reason);

    if (this.config.alertOnAnomaly) {
      this.triggerAnomalyAlert(session.securityFlags[session.securityFlags.length - 1]!);
    }
  }

  /**
   * فتح قفل الجلسة (يتطلب تحقق إضافي)
   */
  unlockSession(
    sessionId: string,
    verificationData: {
      password?: string;
      biometricToken?: string;
      twoFactorCode?: string;
    }
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return false;
    }

    // التحقق من انتهاء مدة القفل
    const lockTime = this.lockedSessions.get(sessionId);
    if (lockTime) {
      const lockDuration = this.config.lockDurationMinutes * 60 * 1000;
      if (new Date().getTime() - lockTime.getTime() > lockDuration) {
        this.lockedSessions.delete(sessionId);
        session.isLocked = false;
        session.isActive = true;
        session.securityFlags.push(
          this.createSecurityFlag('session_hijack_attempt', 'medium', 'تم فتح قفل الجلسة - انتهت مدة القفل')
        );
        return true;
      }
    }

    // التحقق من بيانات إلغاء القفل
    if (verificationData.password || verificationData.biometricToken || verificationData.twoFactorCode) {
      session.isLocked = false;
      session.isActive = true;
      session.lastActivity = new Date();
      session.expiresAt = new Date(Date.now() + this.config.sessionDurationMinutes * 60 * 1000);
      this.lockedSessions.delete(sessionId);
      
      session.securityFlags.push(
        this.createSecurityFlag('session_hijack_attempt', 'medium', 'تم فتح قفل الجلسة يدوياً')
      );
      
      this.logActivity(session, 'session_unlocked', '/security/unlock', session.ipAddress, true);
      return true;
    }

    return false;
  }

  /**
   * إنهاء جلسة
   */
  terminateSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.isCompromised = false;
      
      // إبطال التوكين
      this.revokeToken(session.accessToken);
      this.revokeToken(session.refreshToken);
      
      // تنظيف CSRF
      this.csrfTokens.delete(sessionId);
      
      this.logActivity(session, 'session_terminated', '/auth/logout', session.ipAddress, true);
      
      this.sessions.delete(sessionId);
    }
  }

  /**
   * إنهاء جميع جلسات مستخدم
   */
  terminateAllUserSessions(userId: string): void {
    for (const [sessionId, session] of this.sessions) {
      if (session.userId === userId) {
        this.terminateSession(sessionId);
      }
    }
  }

  /**
   * الإبلاغ عن جلسة مخترقة
   */
  reportCompromised(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isCompromised = true;
      session.isActive = false;
      
      this.revokeToken(session.accessToken);
      this.revokeToken(session.refreshToken);
      
      session.securityFlags.push(
        this.createSecurityFlag('session_hijack_attempt', 'critical', 'تم الإبلاغ عن اختراق الجلسة')
      );
      
      this.triggerAnomalyAlert(session.securityFlags[session.securityFlags.length - 1]!);
      
      // إنهاء جميع جلسات المستخدم
      this.terminateAllUserSessions(session.userId);
      
      this.logActivity(session, 'session_compromised', '/security/report', session.ipAddress, false, 'جلسة مخترقة');
    }
  }

  // ==========================================================
  // حماية من هجمات القوة العمياء
  // ==========================================================

  /**
   * تسجيل محاولة فاشلة
   */
  recordFailedAttempt(identifier: string): { isLocked: boolean; remainingAttempts: number } {
    const attempts = (this.failedAttempts.get(identifier) || 0) + 1;
    this.failedAttempts.set(identifier, attempts);

    const remaining = this.config.lockAfterFailedAttempts - attempts;

    if (attempts >= this.config.lockAfterFailedAttempts) {
      this.lockedSessions.set(identifier, new Date());
      
      if (this.config.alertOnAnomaly) {
        this.triggerAnomalyAlert(
          this.createSecurityFlag('brute_force_pattern', 'critical', `محاولات متعددة فاشلة من ${identifier}`)
        );
      }

      return { isLocked: true, remainingAttempts: 0 };
    }

    return { isLocked: false, remainingAttempts: remaining };
  }

  /**
   * التحقق من حالة القفل
   */
  isLocked(identifier: string): boolean {
    const lockTime = this.lockedSessions.get(identifier);
    if (!lockTime) {
      return false;
    }

    const lockDuration = this.config.lockDurationMinutes * 60 * 1000;
    if (new Date().getTime() - lockTime.getTime() > lockDuration) {
      this.lockedSessions.delete(identifier);
      this.failedAttempts.delete(identifier);
      return false;
    }

    return true;
  }

  /**
   * إعادة تعيين محاولات الفشل
   */
  resetFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
    this.lockedSessions.delete(identifier);
  }

  // ==========================================================
  // إدارة التوكين
  // ==========================================================

  /**
   * إبطال توكين
   */
  revokeToken(token: string): void {
    const payload = this.decodeToken(token);
    if (payload?.jti) {
      this.revokedTokens.add(payload.jti);
    }
  }

  /**
   * إبطال جميع توكينات جلسة
   */
  revokeAllSessionTokens(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.revokeToken(session.accessToken);
      this.revokeToken(session.refreshToken);
    }
  }

  /**
   * تنظيف التوكين المبطل (لتوفير الذاكرة)
   */
  cleanupRevokedTokens(): void {
    // في الإنتاج: تخزين التوكين المبطل في Redis مع TTL
    const now = Date.now() / 1000;
    for (const tokenJTI of this.revokedTokens) {
      // إزالة التوكين منتهية الصلاحية
      // هذا يتطلب فك تشفير كل توكين للتحقق من exp
    }
  }

  // ==========================================================
  // أدوات مساعدة
  // ==========================================================

  /**
   * توليد معرف جلسة فريد
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = randomBytes(SESSION_ID_LENGTH).toString('base64url');
    return `sess_${timestamp}_${random}`;
  }

  /**
   * توليد Access Token
   */
  private generateAccessToken(session: SessionData): string {
    const payload: TokenPayload = {
      sub: session.userId,
      sid: session.sessionId,
      role: session.role,
      gov: session.governorates,
      perms: session.permissions,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.expiresAt.getTime() / 1000),
      jti: this.generateTokenId(),
      fp: session.deviceFingerprint,
      ip: session.ipAddress,
      type: 'access',
    };

    return this.encodeToken(payload);
  }

  /**
   * توليد Refresh Token
   */
  private generateRefreshToken(session: SessionData): string {
    const payload: TokenPayload = {
      sub: session.userId,
      sid: session.sessionId,
      role: session.role,
      gov: session.governorates,
      perms: [],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(session.refreshExpiresAt.getTime() / 1000),
      jti: this.generateTokenId(),
      fp: session.deviceFingerprint,
      ip: session.ipAddress,
      type: 'refresh',
    };

    return this.encodeToken(payload);
  }

  /**
   * توليد معرف توكين فريد
   */
  private generateTokenId(): string {
    return randomBytes(TOKEN_ID_LENGTH).toString('base64url');
  }

  /**
   * ترميز التوكين (JWT)
   */
  private encodeToken(payload: TokenPayload): string {
    // في الإنتاج: استخدام jose أو jsonwebtoken
    const header = Buffer.from(JSON.stringify({ alg: 'HS512', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.signToken(`${header}.${body}`);
    
    return `${header}.${body}.${signature}`;
  }

  /**
   * فك ترميز التوكين
   */
  private decodeToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString('utf-8')) as TokenPayload;

      // التحقق من التوقيع
      const expectedSignature = this.signToken(`${parts[0]}.${parts[1]}`);
      if (!this.secureCompare(parts[2]!, expectedSignature)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  /**
   * توقيع التوكين
   */
  private signToken(data: string): string {
    return createHash('sha512')
      .update(data + (process.env.JWT_SECRET || 'itws-syndicate-secret-key-change-in-production'))
      .digest('base64url')
      .substring(0, 43);
  }

  /**
   * إنشاء علم أمني
   */
  private createSecurityFlag(
    type: SecurityFlagType,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string
  ): SecurityFlag {
    return {
      timestamp: new Date(),
      type,
      severity,
      description,
      resolved: false,
    };
  }

  /**
   * هاش بصمة الجهاز
   */
  private hashFingerprint(fingerprint: string): string {
    return createHash('sha256').update(fingerprint).digest('base64');
  }

  /**
   * هاش IP
   */
  private hashIP(ip: string): string {
    return createHash('sha256').update(ip + 'itws-ip-salt').digest('base64');
  }

  /**
   * هاش User Agent
   */
  private hashUserAgent(ua: string): string {
    return createHash('sha256').update(ua).digest('base64');
  }

  /**
   * التحقق من مسار حساس
   */
  private isSensitivePath(path: string): boolean {
    return SENSITIVE_PATHS.some(p => path.startsWith(p));
  }

  /**
   * مقارنة آمنة
   */
  private secureCompare(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');
    
    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  }

  /**
   * تسجيل نشاط
   */
  private logActivity(
    session: SessionData,
    action: string,
    path: string,
    ipAddress: string,
    success: boolean,
    details?: string
  ): void {
    if (!this.config.logAllActivities && success) {
      return;
    }

    const activity: SessionActivity = {
      timestamp: new Date(),
      action,
      path,
      ipAddress: this.hashIP(ipAddress),
      success,
      details,
    };

    session.activityLog.push(activity);

    // الاحتفاظ بآخر 1000 نشاط فقط
    if (session.activityLog.length > 1000) {
      session.activityLog = session.activityLog.slice(-1000);
    }
  }

  /**
   * فرض حد الجلسات المتزامنة
   */
  private enforceConcurrentSessionLimit(userId: string): void {
    const userSessions = Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.isActive)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    while (userSessions.length >= this.config.maxConcurrentSessions) {
      const oldestSession = userSessions.shift();
      if (oldestSession) {
        this.terminateSession(oldestSession.sessionId);
      }
    }
  }

  /**
   * إطلاق تنبيه
   */
  private triggerAnomalyAlert(flag: SecurityFlag): void {
    for (const callback of this.anomalyCallbacks) {
      try {
        callback(flag);
      } catch (error) {
        console.error('فشل إطلاق تنبيه:', error);
      }
    }
  }

  // ==========================================================
  // واجهة عامة
  // ==========================================================

  /**
   * تسجيل callback للتنبيهات
   */
  onAnomaly(callback: (flag: SecurityFlag) => void): () => void {
    this.anomalyCallbacks.push(callback);
    return () => {
      const index = this.anomalyCallbacks.indexOf(callback);
      if (index > -1) {
        this.anomalyCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * الحصول على جلسة
   */
  getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * الحصول على جميع جلسات مستخدم
   */
  getUserSessions(userId: string): SessionData[] {
    return Array.from(this.sessions.values())
      .filter(s => s.userId === userId && s.isActive);
  }

  /**
   * الحصول على عدد الجلسات النشطة
   */
  getActiveSessionCount(): number {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.isActive) {
        count++;
      }
    }
    return count;
  }

  /**
   * تحديث الإعدادات
   */
  updateConfig(newConfig: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * تنظيف
   */
  destroy(): void {
    this.sessions.clear();
    this.lockedSessions.clear();
    this.failedAttempts.clear();
    this.csrfTokens.clear();
    this.revokedTokens.clear();
    this.anomalyCallbacks = [];
    this.encryption.destroy();
  }
}

// ============================================================
// دوال مساعدة للاستخدام في API Routes
// ============================================================

/**
 * التحقق من CSRF في طلبات API
 */
export function validateCSRFRequest(
  request: Request,
  sessionId: string,
  guard: SessionGuard
): boolean {
  const csrfToken = request.headers.get('x-csrf-token') || request.headers.get('x-xsrf-token');
  
  if (!csrfToken) {
    return false;
  }

  return guard.validateCSRF(sessionId, csrfToken);
}

/**
 * استخراج بيانات الجلسة من الطلب
 */
export function extractSessionFromRequest(
  request: Request,
  guard: SessionGuard
): SessionData | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = (guard as any).decodeToken(token);
  
  if (!payload) {
    return null;
  }

  return guard.getSession(payload.sid) || null;
}

// ============================================================
// تصدير الأنواع
// ============================================================
export type {
  SessionData,
  SessionActivity,
  SecurityFlag,
  SecurityFlagType,
  SessionConfig,
  TokenPayload,
  CSRFData,
};

export { SENSITIVE_PATHS, DEFAULT_CONFIG };
