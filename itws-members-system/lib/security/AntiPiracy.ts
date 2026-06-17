// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// نظام مكافحة القرصنة والنسخ - Anti-Piracy System
// يحتوي على: منع النسخ، منع التصوير، منع الطباعة غير المصرحة،
// كشف أدوات المطورين، حماية المحتوى، العلامات المائية،
// بصمة المتصفح، كشف التلاعب، الحماية من الهندسة العكسية
// آخر تحديث: 2026-06-18
// ============================================================

'use client';

import { useEffect, useRef, useCallback, useState, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

// ============================================================
// أنواع البيانات
// ============================================================
interface AntiPiracyConfig {
  // منع قائمة السياق (زر الفأرة الأيمن)
  disableContextMenu: boolean;
  
  // منع اختصارات لوحة المفاتيح
  disableShortcuts: boolean;
  disabledShortcuts: string[];
  
  // منع تحديد النص
  disableTextSelection: boolean;
  
  // منع السحب والإفلات
  disableDragAndDrop: boolean;
  
  // منع الطباعة
  disablePrint: boolean;
  
  // منع تصوير الشاشة
  disableScreenCapture: boolean;
  
  // منع أدوات المطورين
  disableDevTools: boolean;
  
  // كشف أدوات المطورين
  detectDevTools: boolean;
  devToolsDetectionInterval: number; // بالمللي ثانية
  
  // كشف برامج التصوير
  detectScreenRecorders: boolean;
  
  // كشف Virtual Machines
  detectVirtualMachine: boolean;
  
  // كشف Remote Desktop
  detectRemoteDesktop: boolean;
  
  // كشف متصفحات غير آمنة
  detectInsecureBrowsers: boolean;
  
  // علامة مائية ديناميكية
  enableWatermark: boolean;
  watermarkText: string;
  watermarkOpacity: number;
  
  // حماية الطباعة
  printProtection: boolean;
  printWatermark: boolean;
  
  // كشف التلاعب بالـ DOM
  detectDOMManipulation: boolean;
  domObservationConfig: MutationObserverInit;
  
  // كشف تغيير حجم النافذة (للكشف عن DevTools)
  detectWindowResize: boolean;
  windowResizeThreshold: number;
  
  // تسجيل الانتهاكات
  logViolations: boolean;
  violationCallback?: (violation: PiracyViolation) => void;
  
  // إخفاء المحتوى عند اكتشاف تهديد
  hideContentOnThreat: boolean;
  
  // رسالة التحذير
  warningMessage: string;
  
  // تفعيل الحماية
  enabled: boolean;
  
  // وضع الصمت (لا يظهر تحذيرات)
  silentMode: boolean;
}

interface PiracyViolation {
  type: ViolationType;
  timestamp: Date;
  details: string;
  userAgent: string;
  url: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip?: string;
  userId?: string;
}

type ViolationType =
  | 'context_menu'
  | 'keyboard_shortcut'
  | 'text_selection'
  | 'drag_and_drop'
  | 'print_attempt'
  | 'screen_capture'
  | 'dev_tools_open'
  | 'dev_tools_detected'
  | 'screen_recorder'
  | 'virtual_machine'
  | 'remote_desktop'
  | 'dom_manipulation'
  | 'window_resize_anomaly'
  | 'insecure_browser'
  | 'debugger_statement'
  | 'console_abuse';

interface SecurityEvent extends Event {
  detail?: {
    type: ViolationType;
    message: string;
  };
}

// ============================================================
// الإعدادات الافتراضية
// ============================================================
const DEFAULT_CONFIG: AntiPiracyConfig = {
  disableContextMenu: true,
  disableShortcuts: true,
  disabledShortcuts: [
    'F12',
    'Ctrl+Shift+I',
    'Ctrl+Shift+J',
    'Ctrl+Shift+C',
    'Ctrl+U',
    'Ctrl+S',
    'Ctrl+P',
    'Ctrl+Shift+S',
    'Ctrl+Shift+E',
    'Ctrl+Shift+K',
    'F1',
    'F3',
    'F5',
    'F8',
    'F10',
  ],
  disableTextSelection: true,
  disableDragAndDrop: true,
  disablePrint: true,
  disableScreenCapture: true,
  disableDevTools: true,
  detectDevTools: true,
  devToolsDetectionInterval: 1000,
  detectScreenRecorders: true,
  detectVirtualMachine: true,
  detectRemoteDesktop: true,
  detectInsecureBrowsers: true,
  enableWatermark: true,
  watermarkText: '© ITWS - نقابة تكنولوجيا المعلومات والبرمجيات - جميع الحقوق محفوظة',
  watermarkOpacity: 0.03,
  printProtection: true,
  printWatermark: true,
  detectDOMManipulation: true,
  domObservationConfig: {
    childList: true,
    attributes: true,
    subtree: true,
    characterData: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  },
  detectWindowResize: true,
  windowResizeThreshold: 150,
  logViolations: true,
  hideContentOnThreat: true,
  warningMessage: '⚠️ تحذير أمني: هذه الصفحة محمية. جميع الأنشطة مراقبة ومسجلة.',
  enabled: true,
  silentMode: false,
};

// ============================================================
// كلاس AntiPiracy الرئيسي
// ============================================================
export class AntiPiracy {
  private config: AntiPiracyConfig;
  private violations: PiracyViolation[] = [];
  private devToolsCheckInterval: NodeJS.Timeout | null = null;
  private domObserver: MutationObserver | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private watermarkElement: HTMLDivElement | null = null;
  private originalConsole: Partial<Console> = {};
  private isDevToolsOpen: boolean = false;
  private debuggerDetectionInterval: NodeJS.Timeout | null = null;
  private securityEvents: EventTarget;
  private warningOverlay: HTMLDivElement | null = null;
  private isDestroyed: boolean = false;

  constructor(config: Partial<AntiPiracyConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.securityEvents = new EventTarget();
    
    if (this.config.enabled) {
      this.initialize();
    }
  }

  // ==========================================================
  // التهيئة
  // ==========================================================
  private initialize(): void {
    if (typeof window === 'undefined') return;
    
    this.overrideConsole();
    this.setupEventListeners();
    this.setupDetectionSystems();
    this.setupWatermark();
    this.setupPrintProtection();
    this.detectEnvironment();
    this.showSecurityBanner();
  }

  // ==========================================================
  // تجاوز الكونسول
  // ==========================================================
  private overrideConsole(): void {
    if (typeof window === 'undefined') return;
    
    this.originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug,
      trace: console.trace,
      dir: console.dir,
      dirxml: console.dirxml,
      table: console.table,
      group: console.group,
      groupCollapsed: console.groupCollapsed,
      groupEnd: console.groupEnd,
      time: console.time,
      timeEnd: console.timeEnd,
      profile: console.profile,
      profileEnd: console.profileEnd,
      count: console.count,
      assert: console.assert,
      clear: console.clear,
    };

    // السماح فقط بالأخطاء والتحذيرات
    const noop = (): void => {};
    
    console.log = (...args: any[]) => {
      if ((window as any).ITWS_DEBUG_MODE) {
        this.originalConsole.log?.apply(console, args);
      }
    };
    
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    console.dir = noop;
    console.dirxml = noop;
    console.table = noop;
    console.group = noop;
    console.groupCollapsed = noop;
    console.groupEnd = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.profile = noop;
    console.profileEnd = noop;
    console.count = noop;
    console.assert = noop;
    
    // console.clear ممنوع
    console.clear = (): void => {
      this.logViolation('console_abuse', 'محاولة مسح الكونسول');
      if (!this.config.silentMode) {
        console.warn(this.config.warningMessage);
      }
    };
    
    // console.error يبقى كما هو للتتبع
    console.error = (...args: any[]) => {
      this.originalConsole.error?.apply(console, args);
      this.logViolation('console_abuse', `خطأ في المتصفح: ${args[0]}`);
    };
  }

  // ==========================================================
  // إعداد مستمعي الأحداث
  // ==========================================================
  private setupEventListeners(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // منع قائمة السياق
    if (this.config.disableContextMenu) {
      document.addEventListener('contextmenu', this.handleContextMenu, true);
    }

    // منع اختصارات لوحة المفاتيح
    if (this.config.disableShortcuts) {
      document.addEventListener('keydown', this.handleKeyDown, true);
      window.addEventListener('keydown', this.handleKeyDown, true);
    }

    // منع تحديد النص
    if (this.config.disableTextSelection) {
      document.addEventListener('selectstart', this.handleSelectStart, true);
      document.addEventListener('selectionchange', this.handleSelectionChange);
    }

    // منع السحب والإفلات
    if (this.config.disableDragAndDrop) {
      document.addEventListener('dragstart', this.handleDragStart, true);
      document.addEventListener('drop', this.handleDrop, true);
    }

    // منع تصوير الشاشة
    if (this.config.disableScreenCapture) {
      this.setupScreenCaptureProtection();
    }

    // منع النسخ
    document.addEventListener('copy', this.handleCopy, true);
    document.addEventListener('cut', this.handleCut, true);
    document.addEventListener('paste', this.handlePaste, true);

    // كشف تغيير حجم النافذة
    if (this.config.detectWindowResize) {
      window.addEventListener('resize', this.handleWindowResize);
    }

    // منع قبل الطباعة
    window.addEventListener('beforeprint', this.handleBeforePrint);
    
    // منع بعد الطباعة
    window.addEventListener('afterprint', this.handleAfterPrint);
  }

  // ==========================================================
  // معالجات الأحداث
  // ==========================================================
  private handleContextMenu = (e: MouseEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    this.logViolation('context_menu', 'محاولة فتح قائمة السياق');
    return;
  };

  private handleKeyDown = (e: KeyboardEvent): void => {
    const keyCombo = this.getKeyCombo(e);
    
    if (this.config.disabledShortcuts.includes(keyCombo)) {
      e.preventDefault();
      e.stopPropagation();
      this.logViolation('keyboard_shortcut', `اختصار لوحة مفاتيح ممنوع: ${keyCombo}`);
      return;
    }

    // منع Ctrl+Shift+Delete
    if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // منع Alt+F4
    if (e.altKey && e.key === 'F4') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  };

  private handleSelectStart = (e: Event): void => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-protected="true"]') || target.closest('[data-no-select="true"]')) {
      e.preventDefault();
      this.logViolation('text_selection', 'محاولة تحديد نص محمي');
      return;
    }
  };

  private handleSelectionChange = (): void => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 100) {
      const range = selection.getRangeAt(0);
      if (range.commonAncestorContainer.parentElement?.closest('[data-protected="true"]')) {
        selection.removeAllRanges();
        this.logViolation('text_selection', 'محاولة تحديد كمية كبيرة من النص المحمي');
      }
    }
  };

  private handleDragStart = (e: DragEvent): void => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG' || target.closest('[data-protected="true"]')) {
      e.preventDefault();
      e.stopPropagation();
      this.logViolation('drag_and_drop', 'محاولة سحب عنصر محمي');
      return;
    }
  };

  private handleDrop = (e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  private handleCopy = (e: ClipboardEvent): void => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 50) {
      const range = selection.getRangeAt(0);
      if (range.commonAncestorContainer.parentElement?.closest('[data-protected="true"]')) {
        e.preventDefault();
        e.clipboardData?.setData('text/plain', '');
        this.logViolation('text_selection', 'محاولة نسخ نص محمي');
      }
    }
  };

  private handleCut = (e: ClipboardEvent): void => {
    e.preventDefault();
    this.logViolation('text_selection', 'محاولة قص محتوى');
  };

  private handlePaste = (e: ClipboardEvent): void => {
    // السماح باللصق فقط في حقول الإدخال
    const target = e.target as HTMLElement;
    if (!target.closest('input, textarea, [contenteditable="true"]')) {
      e.preventDefault();
    }
  };

  private handleWindowResize = (): void => {
    const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
    const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
    
    if (widthDiff > this.config.windowResizeThreshold || 
        heightDiff > this.config.windowResizeThreshold) {
      if (!this.isDevToolsOpen) {
        this.isDevToolsOpen = true;
        this.logViolation('window_resize_anomaly', 'تغيير مشبوه في حجم النافذة - احتمال فتح DevTools');
      }
    } else {
      if (this.isDevToolsOpen) {
        this.isDevToolsOpen = false;
      }
    }
  };

  private handleBeforePrint = (): void => {
    if (!(window as any).ITWS_PRINT_AUTHORIZED) {
      // منع الطباعة غير المصرحة
      if (this.config.disablePrint) {
        this.logViolation('print_attempt', 'محاولة طباعة غير مصرح بها');
        // حقن CSS لإخفاء المحتوى
        this.hideContentForPrint();
      }
    }
  };

  private handleAfterPrint = (): void => {
    this.restoreContentAfterPrint();
  };

  // ==========================================================
  // أنظمة الكشف
  // ==========================================================
  private setupDetectionSystems(): void {
    if (typeof window === 'undefined') return;

    // كشف DevTools
    if (this.config.detectDevTools) {
      this.startDevToolsDetection();
    }

    // كشف الـ DOM Manipulation
    if (this.config.detectDOMManipulation) {
      this.startDOMMonitoring();
    }

    // كشف debugger
    this.startDebuggerDetection();

    // مراقبة تغيير الحجم
    if (this.config.detectWindowResize) {
      this.startResizeMonitoring();
    }
  }

  /**
   * كشف DevTools باستخدام عدة طرق
   */
  private startDevToolsDetection(): void {
    if (typeof window === 'undefined') return;

    this.devToolsCheckInterval = setInterval(() => {
      const methods = [
        this.detectByConsoleProfile,
        this.detectByElementId,
        this.detectByUserAgent,
        this.detectByPerformance,
        this.detectByDebugger,
      ];

      for (const method of methods) {
        if (method.call(this)) {
          if (!this.isDevToolsOpen) {
            this.isDevToolsOpen = true;
            this.onDevToolsDetected();
          }
          return;
        }
      }

      if (this.isDevToolsOpen) {
        this.isDevToolsOpen = false;
      }
    }, this.config.devToolsDetectionInterval);
  }

  /**
   * كشف DevTools عبر console.profile
   */
  private detectByConsoleProfile(): boolean {
    const element = new Image();
    let devToolsOpen = false;
    
    Object.defineProperty(element, 'id', {
      get: () => {
        devToolsOpen = true;
        return '';
      },
    });
    
    console.log(element);
    return devToolsOpen;
  }

  /**
   * كشف DevTools عبر العنصر ID
   */
  private detectByElementId(): boolean {
    const threshold = 160;
    const widthDiff = window.outerWidth - window.innerWidth;
    const heightDiff = window.outerHeight - window.innerHeight;
    return widthDiff > threshold || heightDiff > threshold;
  }

  /**
   * كشف DevTools عبر User Agent
   */
  private detectByUserAgent(): boolean {
    const ua = navigator.userAgent;
    return /HeadlessChrome|PhantomJS|Puppeteer|Playwright|Cypress/i.test(ua);
  }

  /**
   * كشف DevTools عبر Performance
   */
  private detectByPerformance(): boolean {
    if (!performance || !performance.memory) return false;
    const memory = (performance as any).memory;
    return memory.usedJSHeapSize > 1000000000; // 1GB
  }

  /**
   * كشف DevTools عبر debugger
   */
  private detectByDebugger(): boolean {
    const startTime = performance.now();
    debugger; // eslint-disable-line no-debugger
    const endTime = performance.now();
    return endTime - startTime > 100;
  }

  /**
   * عند اكتشاف DevTools
   */
  private onDevToolsDetected(): void {
    this.logViolation('dev_tools_detected', 'تم اكتشاف أدوات المطورين');
    
    if (this.config.hideContentOnThreat) {
      this.showWarningOverlay();
    }
    
    // تعطيل المزيد من الوظائف
    this.disableDebugger();
    
    // إرسال حدث أمني
    this.securityEvents.dispatchEvent(new CustomEvent('devtools-detected', {
      detail: { type: 'dev_tools_detected', message: 'DevTools detected' }
    }));
  }

  /**
   * تعطيل debugger
   */
  private disableDebugger(): void {
    const disableFunc = (): void => {
      debugger; // eslint-disable-line no-debugger
    };
    
    this.debuggerDetectionInterval = setInterval(disableFunc, 100);
    
    // استخدام setTimeout متسلسل للتهرب من التعطيل
    const recursiveDisable = (): void => {
      setTimeout(() => {
        debugger; // eslint-disable-line no-debugger
        recursiveDisable();
      }, 50);
    };
    
    recursiveDisable();
  }

  /**
   * مراقبة DOM
   */
  private startDOMMonitoring(): void {
    if (typeof document === 'undefined') return;

    this.domObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // كشف إزالة علامات الحماية
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-protected') {
          const target = mutation.target as HTMLElement;
          if (mutation.oldValue === 'true' && target.getAttribute('data-protected') !== 'true') {
            this.logViolation('dom_manipulation', 'محاولة إزالة حماية عنصر');
            target.setAttribute('data-protected', 'true');
          }
        }

        // كشف إضافة عناصر مشبوهة
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              if (element.tagName === 'SCRIPT' && !element.src) {
                this.logViolation('dom_manipulation', 'محاولة حقن سكريبت غير مصرح به');
                element.remove();
              }
              if (element.tagName === 'IFRAME') {
                this.logViolation('dom_manipulation', 'محاولة إضافة iframe غير مصرح به');
                element.remove();
              }
            }
          });
        }
      }
    });

    this.domObserver.observe(document.documentElement, this.config.domObservationConfig);
  }

  /**
   * مراقبة تغيير الحجم
   */
  private startResizeMonitoring(): void {
    if (typeof document === 'undefined') return;

    this.resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (Math.abs(width - windowWidth) > 100 || Math.abs(height - windowHeight) > 100) {
          this.logViolation('window_resize_anomaly', 'تغيير غير طبيعي في حجم المحتوى');
        }
      }
    });

    this.resizeObserver.observe(document.documentElement);
  }

  /**
   * كشف debugger عبر statements
   */
  private startDebuggerDetection(): void {
    if (typeof window === 'undefined') return;

    const detectDebugger = (): void => {
      const start = performance.now();
      debugger; // eslint-disable-line no-debugger
      const end = performance.now();
      
      if (end - start > 50) {
        this.logViolation('debugger_statement', 'تم اكتشاف debugger خارجي');
      }
    };

    setInterval(detectDebugger, 500);
  }

  // ==========================================================
  // حماية تصوير الشاشة
  // ==========================================================
  private setupScreenCaptureProtection(): void {
    if (typeof navigator === 'undefined') return;

    // تعطيل MediaDevices API
    if (navigator.mediaDevices) {
      const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
      if (originalGetDisplayMedia) {
        navigator.mediaDevices.getDisplayMedia = function(): Promise<MediaStream> {
          console.warn('⚠️ مشاركة الشاشة غير مسموحة في هذا النظام');
          return Promise.reject(new Error('Screen capture is disabled for security reasons'));
        };
      }

      const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
      if (originalGetUserMedia) {
        const allowedConstraints = ['audio'];
        navigator.mediaDevices.getUserMedia = function(constraints): Promise<MediaStream> {
          if (constraints && constraints.video) {
            console.warn('⚠️ تصوير الفيديو غير مسموح في هذا النظام');
            return Promise.reject(new Error('Video capture is disabled for security reasons'));
          }
          return originalGetUserMedia.call(navigator.mediaDevices, constraints);
        };
      }
    }

    // CSS لحماية المحتوى
    const style = document.createElement('style');
    style.id = 'itws-screen-protection';
    style.textContent = `
      @media screen {
        body {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        img[data-watermark="true"] {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================================
  // العلامة المائية
  // ==========================================================
  private setupWatermark(): void {
    if (!this.config.enableWatermark || typeof document === 'undefined') return;

    this.watermarkElement = document.createElement('div');
    this.watermarkElement.id = 'itws-watermark';
    this.watermarkElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 999999;
      opacity: ${this.config.watermarkOpacity};
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(3, 1fr);
      transform: rotate(-15deg) scale(1.5);
    `;

    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        font-weight: bold;
        font-family: 'Tajawal', sans-serif;
        text-shadow: 0 0 10px rgba(255,255,255,0.5);
        white-space: nowrap;
      `;
      cell.textContent = this.config.watermarkText;
      this.watermarkElement.appendChild(cell);
    }

    document.body.appendChild(this.watermarkElement);

    // حماية العلامة المائية من الإزالة
    const watermarkObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.removedNodes.forEach((node) => {
            if (node === this.watermarkElement) {
              document.body.appendChild(this.watermarkElement!);
              this.logViolation('dom_manipulation', 'محاولة إزالة العلامة المائية');
            }
          });
        }
      }
    });

    watermarkObserver.observe(document.body, { childList: true });
  }

  // ==========================================================
  // حماية الطباعة
  // ==========================================================
  private setupPrintProtection(): void {
    if (!this.config.printProtection || typeof document === 'undefined') return;

    const style = document.createElement('style');
    style.id = 'itws-print-protection';
    style.setAttribute('media', 'print');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        body::after {
          content: '${this.config.warningMessage}';
          visibility: visible !important;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          color: red;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  private hideContentForPrint(): void {
    if (typeof document === 'undefined') return;
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.opacity = '0.1';
      mainContent.style.filter = 'blur(10px)';
    }
  }

  private restoreContentAfterPrint(): void {
    if (typeof document === 'undefined') return;
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.style.opacity = '';
      mainContent.style.filter = '';
    }
  }

  // ==========================================================
  // كشف البيئة
  // ==========================================================
  private detectEnvironment(): void {
    if (typeof window === 'undefined') return;

    // كشف Virtual Machine
    if (this.config.detectVirtualMachine) {
      const vmIndicators = [
        navigator.hardwareConcurrency <= 2,
        navigator.deviceMemory && navigator.deviceMemory <= 2,
        /VMware|VirtualBox|QEMU|KVM|Xen/i.test(navigator.userAgent),
        screen.width < 1024 || screen.height < 768,
        !navigator.plugins || navigator.plugins.length === 0,
      ];

      if (vmIndicators.filter(Boolean).length >= 3) {
        this.logViolation('virtual_machine', 'تم اكتشاف بيئة افتراضية', 'high');
      }
    }

    // كشف Remote Desktop
    if (this.config.detectRemoteDesktop) {
      const rdIndicators = [
        screen.colorDepth && screen.colorDepth < 24,
        screen.width < 1366,
        /RDP|Terminal Services|Remote Desktop/i.test(navigator.userAgent),
      ];

      if (rdIndicators.filter(Boolean).length >= 2) {
        this.logViolation('remote_desktop', 'تم اكتشاف اتصال عن بعد', 'high');
      }
    }

    // كشف متصفحات غير آمنة
    if (this.config.detectInsecureBrowsers) {
      const insecureBrowsers = [
        /Trident\/7.0/i, // IE 11
        /MSIE/i, // IE القديم
        /Opera Mini/i,
        /UCBrowser/i,
        /Baidu/i,
        /Maxthon/i,
      ];

      for (const pattern of insecureBrowsers) {
        if (pattern.test(navigator.userAgent)) {
          this.logViolation('insecure_browser', 'متصفح غير آمن أو قديم', 'high');
          break;
        }
      }
    }
  }

  // ==========================================================
  // واجهة التحذير
  // ==========================================================
  private showWarningOverlay(): void {
    if (this.warningOverlay || typeof document === 'undefined') return;

    this.warningOverlay = document.createElement('div');
    this.warningOverlay.id = 'itws-warning-overlay';
    this.warningOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      z-index: 9999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      font-family: 'Tajawal', sans-serif;
    `;

    this.warningOverlay.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 60px; margin-bottom: 20px;">⚠️</div>
        <h1 style="font-size: 28px; margin-bottom: 10px; color: #FF0044;">تحذير أمني</h1>
        <p style="font-size: 16px; color: #FFA500; margin-bottom: 5px;">${this.config.warningMessage}</p>
        <p style="font-size: 14px; color: #888;">تم تسجيل هذا النشاط. الرجاء إغلاق أدوات المطورين للمتابعة.</p>
        <p style="font-size: 12px; color: #666; margin-top: 20px;">IP: ${this.getClientIP()}</p>
        <p style="font-size: 12px; color: #666;">الوقت: ${new Date().toLocaleString('ar-EG')}</p>
      </div>
    `;

    document.body.appendChild(this.warningOverlay);
  }

  private hideWarningOverlay(): void {
    if (this.warningOverlay) {
      this.warningOverlay.remove();
      this.warningOverlay = null;
    }
  }

  // ==========================================================
  // شريط الأمان
  // ==========================================================
  private showSecurityBanner(): void {
    if (typeof console === 'undefined') return;
    
    console.log(
      '%c🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات %c| %cنظام محمي',
      'color: #00F0FF; font-size: 16px; font-weight: bold;',
      'color: #888;',
      'color: #00FF88; font-weight: bold;'
    );
    console.log(
      '%c⚠️ هذه المنصة محمية بأنظمة مكافحة القرصنة. جميع الأنشطة مسجلة.',
      'color: #FFA500; font-size: 12px;'
    );
  }

  // ==========================================================
  // تسجيل الانتهاكات
  // ==========================================================
  private logViolation(
    type: ViolationType,
    details: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ): void {
    const violation: PiracyViolation = {
      type,
      timestamp: new Date(),
      details,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
      severity,
    };

    this.violations.push(violation);

    if (this.config.logViolations) {
      // إرسال إلى الخادم
      this.sendViolationToServer(violation);
    }

    if (this.config.violationCallback) {
      this.config.violationCallback(violation);
    }

    // إطلاق حدث أمني
    this.securityEvents.dispatchEvent(new CustomEvent('violation', {
      detail: violation,
    }));
  }

  private async sendViolationToServer(violation: PiracyViolation): Promise<void> {
    try {
      await fetch('/api/security/violations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(violation),
        keepalive: true,
      });
    } catch {
      // فشل الإرسال - سيتم المحاولة لاحقاً
    }
  }

  // ==========================================================
  // أدوات مساعدة
  // ==========================================================
  private getKeyCombo(e: KeyboardEvent): string {
    const parts: string[] = [];
    if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
    if (e.shiftKey) parts.push('Shift');
    if (e.altKey) parts.push('Alt');
    parts.push(e.key.length === 1 ? e.key.toUpperCase() : e.key);
    return parts.join('+');
  }

  private getClientIP(): string {
    return 'محجوب لأسباب أمنية';
  }

  // ==========================================================
  // واجهة عامة
  // ==========================================================
  public getViolations(): PiracyViolation[] {
    return [...this.violations];
  }

  public getViolationCount(): number {
    return this.violations.length;
  }

  public clearViolations(): void {
    this.violations = [];
  }

  public isDevToolsDetected(): boolean {
    return this.isDevToolsOpen;
  }

  public updateConfig(newConfig: Partial<AntiPiracyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AntiPiracyConfig {
    return { ...this.config };
  }

  public onViolation(callback: (violation: PiracyViolation) => void): () => void {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PiracyViolation>;
      callback(customEvent.detail);
    };
    this.securityEvents.addEventListener('violation', handler);
    return () => this.securityEvents.removeEventListener('violation', handler);
  }

  public onDevToolsDetected(callback: () => void): () => void {
    const handler = () => callback();
    this.securityEvents.addEventListener('devtools-detected', handler);
    return () => this.securityEvents.removeEventListener('devtools-detected', handler);
  }

  public setAuthorizedPrint(allowed: boolean): void {
    (window as any).ITWS_PRINT_AUTHORIZED = allowed;
  }

  public enableDebugMode(): void {
    (window as any).ITWS_DEBUG_MODE = true;
    console.log = this.originalConsole.log || console.log;
  }

  public disableDebugMode(): void {
    (window as any).ITWS_DEBUG_MODE = false;
  }

  // ==========================================================
  // التنظيف
  // ==========================================================
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;

    if (typeof document === 'undefined') return;

    // إزالة مستمعي الأحداث
    document.removeEventListener('contextmenu', this.handleContextMenu, true);
    document.removeEventListener('keydown', this.handleKeyDown, true);
    document.removeEventListener('selectstart', this.handleSelectStart, true);
    document.removeEventListener('selectionchange', this.handleSelectionChange);
    document.removeEventListener('dragstart', this.handleDragStart, true);
    document.removeEventListener('drop', this.handleDrop, true);
    document.removeEventListener('copy', this.handleCopy, true);
    document.removeEventListener('cut', this.handleCut, true);
    document.removeEventListener('paste', this.handlePaste, true);
    window.removeEventListener('resize', this.handleWindowResize);
    window.removeEventListener('beforeprint', this.handleBeforePrint);
    window.removeEventListener('afterprint', this.handleAfterPrint);

    // إيقاف الفواصل الزمنية
    if (this.devToolsCheckInterval) clearInterval(this.devToolsCheckInterval);
    if (this.debuggerDetectionInterval) clearInterval(this.debuggerDetectionInterval);

    // إيقاف المراقبين
    this.domObserver?.disconnect();
    this.resizeObserver?.disconnect();

    // إزالة العلامة المائية
    this.watermarkElement?.remove();

    // إزالة واجهة التحذير
    this.hideWarningOverlay();

    // إزالة أنماط الحماية
    document.getElementById('itws-screen-protection')?.remove();
    document.getElementById('itws-print-protection')?.remove();

    // استعادة الكونسول
    if (this.originalConsole.log) console.log = this.originalConsole.log;
    if (this.originalConsole.warn) console.warn = this.originalConsole.warn;
    if (this.originalConsole.error) console.error = this.originalConsole.error;
    if (this.originalConsole.info) console.info = this.originalConsole.info;
    if (this.originalConsole.debug) console.debug = this.originalConsole.debug;
    if (this.originalConsole.clear) console.clear = this.originalConsole.clear;
  }
}

// ============================================================
// مكون React المغلف
// ============================================================
interface AntiPiracyWrapperProps {
  children: ReactNode;
  config?: Partial<AntiPiracyConfig>;
  showWarning?: boolean;
}

export function AntiPiracyWrapper({
  children,
  config = {},
  showWarning = false,
}: AntiPiracyWrapperProps): JSX.Element {
  const antiPiracyRef = useRef<AntiPiracy | null>(null);
  const [isThreatDetected, setIsThreatDetected] = useState(false);

  useEffect(() => {
    antiPiracyRef.current = new AntiPiracy({
      ...config,
      violationCallback: (violation) => {
        if (violation.severity === 'high' || violation.severity === 'critical') {
          setIsThreatDetected(true);
        }
        if (config.violationCallback) {
          config.violationCallback(violation);
        }
      },
    });

    const unsubscribeDevTools = antiPiracyRef.current.onDevToolsDetected(() => {
      setIsThreatDetected(true);
    });

    return () => {
      unsubscribeDevTools();
      antiPiracyRef.current?.destroy();
    };
  }, []);

  if (isThreatDetected && showWarning) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.98)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        color: 'white',
      }}>
        <div style={{ fontSize: 60, marginBottom: 20 }}>⚠️</div>
        <h1 style={{ fontSize: 28, marginBottom: 10, color: '#FF0044' }}>تحذير أمني</h1>
        <p style={{ fontSize: 16, color: '#FFA500' }}>تم اكتشاف نشاط مشبوه</p>
        <p style={{ fontSize: 14, color: '#888', marginTop: 10 }}>الرجاء إغلاق جميع أدوات التطوير للمتابعة</p>
      </div>
    );
  }

  return <>{children}</>;
}

// ============================================================
// دالة مساعدة: إنشاء نسخة من AntiPiracy
// ============================================================
export function createAntiPiracy(config?: Partial<AntiPiracyConfig>): AntiPiracy {
  return new AntiPiracy(config);
}

// ============================================================
// تصدير الإعدادات الافتراضية
// ============================================================
export { DEFAULT_CONFIG };
export type { AntiPiracyConfig, PiracyViolation, ViolationType };
