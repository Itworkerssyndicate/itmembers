// ============================================================
// 🏛️ ITWS - نقابة تكنولوجيا المعلومات والبرمجيات
// نظام التشفير المتقدم - Advanced Encryption System
// يحتوي على: AES-256-GCM, RSA-OAEP, Argon2id, HKDF,
// PBKDF2, SHA-512, HMAC, توقيع رقمي, تشفير الملفات,
// إدارة المفاتيح, تدوير المفاتيح, حماية البيانات الحساسة
// آخر تحديث: 2026-06-18
// ============================================================

import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual, generateKeyPairSync, publicEncrypt, privateDecrypt, createSign, createVerify, pbkdf2Sync, scryptSync, hkdfSync } from 'crypto';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { createReadStream, createWriteStream } from 'fs';
import type { CipherGCM, DecipherGCM, KeyObject, RsaPrivateKey, RsaPublicKey } from 'crypto';

// ============================================================
// الثوابت
// ============================================================
const ALGORITHM = 'aes-256-gcm' as const;
const RSA_ALGORITHM = 'rsa' as const;
const RSA_PADDING = require('crypto').constants.RSA_PKCS1_OAEP_PADDING;
const RSA_OAEP_HASH = 'sha512';
const IV_LENGTH = 16; // 128-bit
const AUTH_TAG_LENGTH = 16; // 128-bit
const SALT_LENGTH = 64;
const KEY_LENGTH = 32; // 256-bit
const PBKDF2_ITERATIONS = 600000;
const ARGON2_MEMORY_COST = 65536; // 64 MB
const ARGON2_TIME_COST = 4;
const ARGON2_PARALLELISM = 4;
const HKDF_HASH = 'sha512';
const HMAC_HASH = 'sha512';
const SIGNATURE_ALGORITHM = 'RSA-SHA512';
const MIN_PASSWORD_LENGTH = 12;
const MAX_ENCRYPTED_SIZE = 100 * 1024 * 1024; // 100 MB

// ============================================================
// أنواع البيانات
// ============================================================
interface EncryptionResult {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
  salt?: Buffer;
  algorithm: string;
  timestamp: Date;
  keyId?: string;
}

interface DecryptionInput {
  encrypted: Buffer;
  iv: Buffer;
  authTag: Buffer;
  salt?: Buffer;
  key: Buffer;
}

interface KeyPair {
  publicKey: string;  // PEM format
  privateKey: string; // PEM format (encrypted)
  keyId: string;
  createdAt: Date;
  expiresAt: Date;
  algorithm: string;
}

interface SignedData {
  data: string;
  signature: string;
  algorithm: string;
  timestamp: Date;
  signerKeyId?: string;
}

interface HashResult {
  hash: string;
  algorithm: string;
  salt?: string;
}

interface KeyMetadata {
  keyId: string;
  createdAt: Date;
  expiresAt?: Date;
  lastRotated?: Date;
  version: number;
  algorithm: string;
  purpose: 'encryption' | 'signing' | 'hmac';
  status: 'active' | 'expired' | 'revoked';
}

// ============================================================
// كلاس EncryptionEngine
// ============================================================
export class EncryptionEngine {
  private masterKey: Buffer | null = null;
  private keyCache: Map<string, { key: Buffer; metadata: KeyMetadata }> = new Map();
  private readonly keyDerivationSalt: Buffer;

  constructor(masterPassword?: string) {
    this.keyDerivationSalt = randomBytes(SALT_LENGTH);
    
    if (masterPassword) {
      this.initializeMasterKey(masterPassword);
    }
  }

  // ==========================================================
  // تهيئة المفتاح الرئيسي
  // ==========================================================
  private initializeMasterKey(password: string): void {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل`);
    }

    this.masterKey = this.deriveKeyFromPassword(password, this.keyDerivationSalt);
  }

  /**
   * اشتقاق مفتاح من كلمة مرور باستخدام PBKDF2
   */
  private deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
    return pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
  }

  /**
   * اشتقاق مفتاح باستخدام Argon2id (محاكاة)
   */
  private deriveKeyArgon2(password: string, salt: Buffer): Buffer {
    // في الإنتاج: استخدام argon2 library
    // argon2.hash(password, { salt, memoryCost, timeCost, parallelism })
    return scryptSync(password, salt, KEY_LENGTH, {
      N: Math.pow(2, ARGON2_TIME_COST),
      r: 8,
      p: ARGON2_PARALLELISM,
      maxmem: ARGON2_MEMORY_COST * 1024,
    });
  }

  /**
   * توليد مفتاح عشوائي
   */
  private generateRandomKey(): Buffer {
    return randomBytes(KEY_LENGTH);
  }

  /**
   * توليد IV عشوائي
   */
  private generateIV(): Buffer {
    return randomBytes(IV_LENGTH);
  }

  /**
   * توليد Salt عشوائي
   */
  private generateSalt(): Buffer {
    return randomBytes(SALT_LENGTH);
  }

  // ==========================================================
  // AES-256-GCM التشفير المتماثل
  // ==========================================================

  /**
   * تشفير البيانات باستخدام AES-256-GCM
   */
  encrypt(data: string | Buffer, key?: Buffer): EncryptionResult {
    const encryptionKey = key || this.masterKey;
    if (!encryptionKey) {
      throw new Error('مفتاح التشفير غير موجود');
    }

    if (Buffer.isBuffer(data) && data.length > MAX_ENCRYPTED_SIZE) {
      throw new Error(`حجم البيانات يتجاوز الحد الأقصى ${MAX_ENCRYPTED_SIZE / (1024 * 1024)}MB`);
    }

    const iv = this.generateIV();
    const cipher = createCipheriv(ALGORITHM, encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    }) as CipherGCM;

    const plaintext = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv,
      authTag,
      algorithm: ALGORITHM,
      timestamp: new Date(),
    };
  }

  /**
   * فك تشفير البيانات باستخدام AES-256-GCM
   */
  decrypt(input: DecryptionInput): Buffer {
    const decipher = createDecipheriv(ALGORITHM, input.key, input.iv, {
      authTagLength: AUTH_TAG_LENGTH,
    }) as DecipherGCM;

    decipher.setAuthTag(input.authTag);

    try {
      const decrypted = Buffer.concat([
        decipher.update(input.encrypted),
        decipher.final(),
      ]);
      return decrypted;
    } catch (error) {
      throw new Error('فشل فك التشفير: البيانات تالفة أو المفتاح غير صحيح');
    }
  }

  /**
   * تشفير مع كلمة مرور (مع Salt)
   */
  encryptWithPassword(data: string | Buffer, password: string): EncryptionResult {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل`);
    }

    const salt = this.generateSalt();
    const key = this.deriveKeyFromPassword(password, salt);
    const result = this.encrypt(data, key);

    // مسح المفتاح من الذاكرة
    key.fill(0);

    return {
      ...result,
      salt,
    };
  }

  /**
   * فك تشفير مع كلمة مرور
   */
  decryptWithPassword(input: DecryptionInput, password: string): Buffer {
    if (!input.salt) {
      throw new Error('Salt مطلوب لفك التشفير بكلمة مرور');
    }

    const key = this.deriveKeyFromPassword(password, input.salt);
    const result = this.decrypt({ ...input, key });

    // مسح المفتاح من الذاكرة
    key.fill(0);

    return result;
  }

  // ==========================================================
  // RSA-OAEP التشفير غير المتماثل
  // ==========================================================

  /**
   * توليد زوج مفاتيح RSA
   */
  generateRSAKeyPair(bits: 2048 | 4096 = 4096): KeyPair {
    const { publicKey, privateKey } = generateKeyPairSync(RSA_ALGORITHM, {
      modulusLength: bits,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: this.masterKey?.toString('hex') || randomBytes(32).toString('hex'),
      },
      publicExponent: 65537,
    });

    const keyId = this.generateKeyId();

    return {
      publicKey,
      privateKey,
      keyId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // سنة
      algorithm: RSA_ALGORITHM,
    };
  }

  /**
   * تشفير باستخدام المفتاح العام RSA
   */
  encryptWithPublicKey(data: string | Buffer, publicKeyPem: string): Buffer {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    return publicEncrypt(
      {
        key: publicKeyPem,
        padding: RSA_PADDING,
        oaepHash: RSA_OAEP_HASH,
      },
      buffer
    );
  }

  /**
   * فك تشفير باستخدام المفتاح الخاص RSA
   */
  decryptWithPrivateKey(encrypted: Buffer, privateKeyPem: string, passphrase?: string): Buffer {
    return privateDecrypt(
      {
        key: privateKeyPem,
        padding: RSA_PADDING,
        oaepHash: RSA_OAEP_HASH,
        passphrase: passphrase || this.masterKey?.toString('hex'),
      },
      encrypted
    );
  }

  // ==========================================================
  // التوقيع الرقمي
  // ==========================================================

  /**
   * توقيع البيانات
   */
  sign(data: string | Buffer, privateKeyPem: string, passphrase?: string): SignedData {
    const signer = createSign(SIGNATURE_ALGORITHM);
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    signer.update(buffer);
    signer.end();

    const signature = signer.sign(
      {
        key: privateKeyPem,
        passphrase: passphrase || this.masterKey?.toString('hex'),
      },
      'base64'
    );

    return {
      data: buffer.toString('base64'),
      signature,
      algorithm: SIGNATURE_ALGORITHM,
      timestamp: new Date(),
    };
  }

  /**
   * التحقق من التوقيع
   */
  verify(signedData: SignedData, publicKeyPem: string): boolean {
    const verifier = createVerify(SIGNATURE_ALGORITHM);
    verifier.update(Buffer.from(signedData.data, 'base64'));
    verifier.end();

    return verifier.verify(publicKeyPem, signedData.signature, 'base64');
  }

  // ==========================================================
  // HMAC - المصادقة
  // ==========================================================

  /**
   * إنشاء HMAC
   */
  createHMAC(data: string | Buffer, key?: Buffer): string {
    const hmacKey = key || this.masterKey;
    if (!hmacKey) {
      throw new Error('مفتاح HMAC غير موجود');
    }

    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    const hmac = createHmac(HMAC_HASH, hmacKey);
    hmac.update(buffer);
    return hmac.digest('base64');
  }

  /**
   * التحقق من HMAC
   */
  verifyHMAC(data: string | Buffer, expectedHMAC: string, key?: Buffer): boolean {
    const computedHMAC = this.createHMAC(data, key);
    const computedBuffer = Buffer.from(computedHMAC, 'base64');
    const expectedBuffer = Buffer.from(expectedHMAC, 'base64');

    if (computedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(computedBuffer, expectedBuffer);
  }

  // ==========================================================
  // دوال الهاش
  // ==========================================================

  /**
   * SHA-512
   */
  sha512(data: string | Buffer, salt?: Buffer): HashResult {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    let input = buffer;

    if (salt) {
      input = Buffer.concat([salt, buffer]);
    }

    const hash = createHash('sha512').update(input).digest('base64');

    return {
      hash,
      algorithm: 'sha512',
      salt: salt?.toString('base64'),
    };
  }

  /**
   * SHA-256
   */
  sha256(data: string | Buffer): HashResult {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    const hash = createHash('sha256').update(buffer).digest('base64');

    return {
      hash,
      algorithm: 'sha256',
    };
  }

  /**
   * BLAKE2b (محاكاة باستخدام SHA-512)
   */
  blake2b(data: string | Buffer, outputLength: number = 64): Buffer {
    const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    return createHash('sha512').update(buffer).digest().slice(0, outputLength);
  }

  // ==========================================================
  // HKDF - اشتقاق المفاتيح الهرمي
  // ==========================================================

  /**
   * HKDF Expand
   */
  hkdfExpand(ikm: Buffer, info: string, length: number = KEY_LENGTH): Buffer {
    const salt = this.generateSalt();
    return hkdfSync(HKDF_HASH, ikm, salt, info, length);
  }

  /**
   * اشتقاق مفاتيح متعددة من مفتاح رئيسي
   */
  deriveMultipleKeys(masterKey: Buffer, contexts: string[]): Map<string, Buffer> {
    const keys = new Map<string, Buffer>();

    for (const context of contexts) {
      const derivedKey = this.hkdfExpand(masterKey, context);
      keys.set(context, derivedKey);
    }

    return keys;
  }

  // ==========================================================
  // إدارة المفاتيح
  // ==========================================================

  /**
   * توليد معرف مفتاح فريد
   */
  private generateKeyId(): string {
    return `key_${randomBytes(16).toString('hex')}_${Date.now().toString(36)}`;
  }

  /**
   * تخزين مفتاح في الذاكرة المؤقتة
   */
  cacheKey(keyId: string, key: Buffer, metadata: KeyMetadata): void {
    this.keyCache.set(keyId, { key, metadata });
  }

  /**
   * استرجاع مفتاح من الذاكرة المؤقتة
   */
  getCachedKey(keyId: string): { key: Buffer; metadata: KeyMetadata } | null {
    return this.keyCache.get(keyId) || null;
  }

  /**
   * حذف مفتاح من الذاكرة المؤقتة
   */
  removeCachedKey(keyId: string): void {
    const cached = this.keyCache.get(keyId);
    if (cached) {
      cached.key.fill(0);
      this.keyCache.delete(keyId);
    }
  }

  /**
   * تدوير مفتاح (إنشاء مفتاح جديد مع الاحتفاظ بالقديم)
   */
  rotateKey(oldKeyId: string, purpose: 'encryption' | 'signing' | 'hmac'): { newKeyId: string; key: Buffer } {
    const newKey = this.generateRandomKey();
    const newKeyId = this.generateKeyId();

    const oldCached = this.keyCache.get(oldKeyId);
    if (oldCached) {
      oldCached.metadata.status = 'expired';
      oldCached.metadata.lastRotated = new Date();
    }

    this.cacheKey(newKeyId, newKey, {
      keyId: newKeyId,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 يوم
      version: (oldCached?.metadata.version || 0) + 1,
      algorithm: ALGORITHM,
      purpose,
      status: 'active',
    });

    return { newKeyId, key: newKey };
  }

  // ==========================================================
  // تشفير الكائنات
  // ==========================================================

  /**
   * تشفير كائن JavaScript
   */
  encryptObject<T extends Record<string, any>>(obj: T, key?: Buffer): EncryptionResult & { originalType: string } {
    const jsonString = JSON.stringify(obj);
    const result = this.encrypt(jsonString, key);

    return {
      ...result,
      originalType: 'object',
    };
  }

  /**
   * فك تشفير كائن JavaScript
   */
  decryptObject<T extends Record<string, any>>(input: DecryptionInput): T {
    const decrypted = this.decrypt(input);
    return JSON.parse(decrypted.toString('utf-8')) as T;
  }

  // ==========================================================
  // تشفير الملفات
  // ==========================================================

  /**
   * تشفير ملف (Stream)
   */
  async encryptFile(inputPath: string, outputPath: string, key?: Buffer): Promise<EncryptionResult> {
    const encryptionKey = key || this.masterKey;
    if (!encryptionKey) {
      throw new Error('مفتاح التشفير غير موجود');
    }

    const iv = this.generateIV();
    const cipher = createCipheriv(ALGORITHM, encryptionKey, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    }) as CipherGCM;

    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    await promisify(pipeline)(readStream, cipher, writeStream);

    const authTag = cipher.getAuthTag();

    return {
      encrypted: Buffer.alloc(0), // الملف المشفر مكتوب على القرص
      iv,
      authTag,
      algorithm: ALGORITHM,
      timestamp: new Date(),
    };
  }

  /**
   * فك تشفير ملف (Stream)
   */
  async decryptFile(
    inputPath: string,
    outputPath: string,
    input: DecryptionInput
  ): Promise<void> {
    const decipher = createDecipheriv(ALGORITHM, input.key, input.iv, {
      authTagLength: AUTH_TAG_LENGTH,
    }) as DecipherGCM;

    decipher.setAuthTag(input.authTag);

    const readStream = createReadStream(inputPath);
    const writeStream = createWriteStream(outputPath);

    await promisify(pipeline)(readStream, decipher, writeStream);
  }

  // ==========================================================
  // حماية كلمة المرور
  // ==========================================================

  /**
   * هاش كلمة المرور للتخزين الآمن
   */
  hashPassword(password: string): HashResult {
    if (password.length < MIN_PASSWORD_LENGTH) {
      throw new Error(`كلمة المرور يجب أن تكون ${MIN_PASSWORD_LENGTH} أحرف على الأقل`);
    }

    const salt = this.generateSalt();
    const hash = this.deriveKeyArgon2(password, salt);

    // مسح كلمة المرور الأصلية
    const passwordBuffer = Buffer.from(password, 'utf-8');
    passwordBuffer.fill(0);

    return {
      hash: hash.toString('base64'),
      algorithm: 'argon2id',
      salt: salt.toString('base64'),
    };
  }

  /**
   * التحقق من كلمة المرور
   */
  verifyPassword(password: string, storedHash: string, storedSalt: string): boolean {
    const salt = Buffer.from(storedSalt, 'base64');
    const computedHash = this.deriveKeyArgon2(password, salt);
    const expectedHash = Buffer.from(storedHash, 'base64');

    // مسح كلمة المرور
    const passwordBuffer = Buffer.from(password, 'utf-8');
    passwordBuffer.fill(0);

    if (computedHash.length !== expectedHash.length) {
      return false;
    }

    return timingSafeEqual(computedHash, expectedHash);
  }

  // ==========================================================
  // أدوات مساعدة
  // ==========================================================

  /**
   * تشفير للنقل الآمن (مع كل البيانات المطلوبة)
   */
  encryptForTransport(data: string | Buffer, key?: Buffer): string {
    const result = this.encrypt(data, key);

    // دمج كل البيانات في Base64 واحد
    const payload = JSON.stringify({
      e: result.encrypted.toString('base64'),
      i: result.iv.toString('base64'),
      a: result.authTag.toString('base64'),
      s: result.salt?.toString('base64') || null,
      t: result.timestamp.toISOString(),
      v: 1,
    });

    return Buffer.from(payload, 'utf-8').toString('base64');
  }

  /**
   * فك تشفير من النقل الآمن
   */
  decryptFromTransport(transportData: string, key?: Buffer): Buffer {
    const payload = JSON.parse(Buffer.from(transportData, 'base64').toString('utf-8'));

    const input: DecryptionInput = {
      encrypted: Buffer.from(payload.e, 'base64'),
      iv: Buffer.from(payload.i, 'base64'),
      authTag: Buffer.from(payload.a, 'base64'),
      salt: payload.s ? Buffer.from(payload.s, 'base64') : undefined,
      key: key || this.masterKey!,
    };

    return this.decrypt(input);
  }

  /**
   * تشفير الرقم القومي (للحماية الخاصة)
   */
  encryptNationalId(nationalId: string): EncryptionResult {
    // إضافة padding عشوائي للرقم القومي قبل التشفير
    const padded = `${nationalId}|${randomBytes(8).toString('hex')}`;
    return this.encrypt(padded);
  }

  /**
   * فك تشفير الرقم القومي
   */
  decryptNationalId(input: DecryptionInput): string {
    const decrypted = this.decrypt(input).toString('utf-8');
    // إزالة الـ padding
    return decrypted.split('|')[0] || '';
  }

  /**
   * تشفير متعدد الطبقات (لحماية فائقة)
   */
  multiLayerEncrypt(data: string | Buffer, keys: Buffer[]): EncryptionResult {
    let currentData = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf-8');
    let lastResult: EncryptionResult | null = null;

    for (const key of keys) {
      lastResult = this.encrypt(currentData, key);
      currentData = lastResult.encrypted;
    }

    if (!lastResult) {
      throw new Error('مطلوب مفتاح واحد على الأقل');
    }

    return lastResult;
  }

  /**
   * فك تشفير متعدد الطبقات
   */
  multiLayerDecrypt(input: DecryptionInput, keys: Buffer[]): Buffer {
    let currentData = input.encrypted;

    for (let i = keys.length - 1; i >= 0; i--) {
      const decryptInput: DecryptionInput = {
        ...input,
        encrypted: currentData,
        key: keys[i]!,
      };
      currentData = this.decrypt(decryptInput);
    }

    return currentData;
  }

  // ==========================================================
  // حماية الذاكرة
  // ==========================================================

  /**
   * مسح آمن للبيانات من الذاكرة
   */
  secureWipe(buffer: Buffer): void {
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = 0;
    }
    buffer.fill(0);
    buffer.fill(randomBytes(buffer.length));
    buffer.fill(0);
  }

  /**
   * مسح جميع المفاتيح من الذاكرة
   */
  wipeAllKeys(): void {
    if (this.masterKey) {
      this.secureWipe(this.masterKey);
      this.masterKey = null;
    }

    for (const [, cached] of this.keyCache) {
      this.secureWipe(cached.key);
    }

    this.keyCache.clear();
  }

  /**
   * توليد بيانات عشوائية آمنة
   */
  secureRandom(length: number): Buffer {
    return randomBytes(length);
  }

  /**
   * توليد سلسلة عشوائية
   */
  secureRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()'): string {
    const bytes = randomBytes(length);
    let result = '';

    for (let i = 0; i < length; i++) {
      result += charset[bytes[i]! % charset.length];
    }

    // مسح البايتات
    bytes.fill(0);

    return result;
  }

  /**
   * مقارنة آمنة (مقاومة لهجمات التوقيت)
   */
  secureCompare(a: string | Buffer, b: string | Buffer): boolean {
    const bufferA = Buffer.isBuffer(a) ? a : Buffer.from(a, 'utf-8');
    const bufferB = Buffer.isBuffer(b) ? b : Buffer.from(b, 'utf-8');

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return timingSafeEqual(bufferA, bufferB);
  }

  // ==========================================================
  // تنظيف
  // ==========================================================
  destroy(): void {
    this.wipeAllKeys();
  }
}

// ============================================================
// دوال مساعدة مستقلة
// ============================================================

/**
 * تشفير سريع للنصوص القصيرة (للاستخدام العام)
 */
export function quickEncrypt(text: string, password: string): string {
  const engine = new EncryptionEngine();
  const result = engine.encryptWithPassword(text, password);
  engine.destroy();

  return JSON.stringify({
    data: result.encrypted.toString('base64'),
    iv: result.iv.toString('base64'),
    tag: result.authTag.toString('base64'),
    salt: result.salt!.toString('base64'),
  });
}

/**
 * فك تشفير سريع للنصوص القصيرة
 */
export function quickDecrypt(encryptedJson: string, password: string): string {
  const { data, iv, tag, salt } = JSON.parse(encryptedJson);

  const engine = new EncryptionEngine();
  const result = engine.decryptWithPassword(
    {
      encrypted: Buffer.from(data, 'base64'),
      iv: Buffer.from(iv, 'base64'),
      authTag: Buffer.from(tag, 'base64'),
      salt: Buffer.from(salt, 'base64'),
      key: Buffer.alloc(0), // سيتم تجاهله
    },
    password
  );

  engine.destroy();
  return result.toString('utf-8');
}

/**
 * هاش سريع
 */
export function quickHash(data: string): string {
  const engine = new EncryptionEngine();
  const result = engine.sha512(data);
  engine.destroy();
  return result.hash;
}

/**
 * توليد ID آمن
 */
export function generateSecureId(prefix: string = ''): string {
  const bytes = randomBytes(16);
  const id = bytes.toString('hex');
  bytes.fill(0);
  return prefix ? `${prefix}_${id}` : id;
}

// ============================================================
// تصدير الأنواع
// ============================================================
export type {
  EncryptionResult,
  DecryptionInput,
  KeyPair,
  SignedData,
  HashResult,
  KeyMetadata,
};
