import { useState, useEffect, useCallback } from 'react';
import { capacitorStorage } from '@/utils/capacitorStorage';

const SECURITY_KEY = 'finance_security';

export type AuthMethod = 'pin' | 'biometric' | 'none';

export interface SecuritySettings {
  enabled: boolean;
  method: AuthMethod;
  pinHash?: string;
  pinSalt?: string;
  autoLockTimeout: number;
  lastAuthenticated?: string;
}

// ── Crypto helpers (Web Crypto API) ─────────────────────────────────────────

/** Genera 16 bytes de salt aleatorio como hex string */
async function generateSalt(): Promise<string> {
  const buf = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Convierte hex string → Uint8Array */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/** Convierte ArrayBuffer → hex string */
function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hashea el PIN usando PBKDF2-SHA256 con el salt dado.
 * Usa 100 000 iteraciones — lento a propósito para dificultar ataques de fuerza bruta.
 */
async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: hexToBytes(salt) as BufferSource,
      iterations: 100_000,
    },
    keyMaterial,
    256,
  );
  return bufToHex(derived);
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSecurity() {
  const [isLocked, setIsLocked] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SecuritySettings>({
    enabled: false,
    method: 'none',
    autoLockTimeout: 5,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const saved = await capacitorStorage.getItem<SecuritySettings>(SECURITY_KEY);
    if (saved) {
      setSettings(saved);
      if (saved.enabled && saved.lastAuthenticated) {
        const diffMinutes =
          (Date.now() - new Date(saved.lastAuthenticated).getTime()) / 60_000;
        if (diffMinutes < saved.autoLockTimeout) {
          setIsLocked(false);
        }
      } else if (!saved.enabled) {
        setIsLocked(false);
      }
    } else {
      setIsLocked(false);
    }
    setIsLoading(false);
  };

  const setupPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (pin.length < 4 || pin.length > 6) return false;

      const salt = await generateSalt();
      const pinHash = await hashPin(pin, salt);

      const newSettings: SecuritySettings = {
        ...settings,
        enabled: true,
        method: 'pin',
        pinHash,
        pinSalt: salt,
        lastAuthenticated: new Date().toISOString(),
      };
      await capacitorStorage.setItem(SECURITY_KEY, newSettings);
      setSettings(newSettings);
      setIsLocked(false);
      return true;
    },
    [settings],
  );

  const verifyPin = useCallback(
    async (pin: string): Promise<boolean> => {
      if (!settings.pinHash || !settings.pinSalt) return false;

      const hash = await hashPin(pin, settings.pinSalt);
      const isValid = hash === settings.pinHash;

      if (isValid) {
        const updated = { ...settings, lastAuthenticated: new Date().toISOString() };
        await capacitorStorage.setItem(SECURITY_KEY, updated);
        setSettings(updated);
        setIsLocked(false);
      }
      return isValid;
    },
    [settings],
  );

  const disableSecurity = useCallback(async () => {
    const newSettings: SecuritySettings = {
      enabled: false,
      method: 'none',
      autoLockTimeout: 5,
    };
    await capacitorStorage.setItem(SECURITY_KEY, newSettings);
    setSettings(newSettings);
    setIsLocked(false);
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);

  const changePin = useCallback(
    async (oldPin: string, newPin: string): Promise<boolean> => {
      const isValid = await verifyPin(oldPin);
      if (!isValid) return false;

      const salt = await generateSalt();
      const pinHash = await hashPin(newPin, salt);
      const updated = { ...settings, pinHash, pinSalt: salt };
      await capacitorStorage.setItem(SECURITY_KEY, updated);
      setSettings(updated);
      return true;
    },
    [settings, verifyPin],
  );

  const updateAutoLockTimeout = useCallback(
    async (minutes: number) => {
      const updated = { ...settings, autoLockTimeout: minutes };
      await capacitorStorage.setItem(SECURITY_KEY, updated);
      setSettings(updated);
    },
    [settings],
  );

  return {
    isLocked,
    isLoading,
    settings,
    setupPin,
    verifyPin,
    disableSecurity,
    lock,
    changePin,
    updateAutoLockTimeout,
  };
}
