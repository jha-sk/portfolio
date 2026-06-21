'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  TIER, QUALITY_PREF, QUALITY_STORAGE_KEY, resolveTier, applyOverride,
} from './device-tier';

/** One-time WebGL capability probe: 'ok' | 'software' | 'none'. */
function probeWebGL() {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) return 'none';
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const renderer = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|microsoft basic/i.test(renderer)) return 'software';
    return 'ok';
  } catch {
    return 'none';
  }
}

function collectSignals() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return {
    width: window.innerWidth,
    deviceMemory: typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null,
    cores: typeof navigator.hardwareConcurrency === 'number' ? navigator.hardwareConcurrency : null,
    coarsePointer: window.matchMedia('(pointer: coarse)').matches,
    saveData: Boolean(navigator.connection && navigator.connection.saveData),
    reducedMotion,
    webgl: probeWebGL(),
  };
}

function readStoredQuality() {
  try {
    const v = localStorage.getItem(QUALITY_STORAGE_KEY);
    if (v === QUALITY_PREF.LOW || v === QUALITY_PREF.HIGH || v === QUALITY_PREF.AUTO) return v;
  } catch {
    /* ignore */
  }
  return QUALITY_PREF.AUTO;
}

/**
 * Resolve the active rendering tier with a persisted Low/Auto/High override.
 * SSR-safe: returns a deterministic { tier: 'low' } until mounted, then upgrades
 * on the client (prevents hydration mismatch; crawlers/no-JS keep full content).
 *
 * @returns {{ tier: 'low'|'mid'|'high', quality: 'low'|'auto'|'high', mounted: boolean, setQuality: (q:string)=>void }}
 */
export function useDeviceTier() {
  const [mounted, setMounted] = useState(false);
  const [resolved, setResolved] = useState(TIER.LOW);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [quality, setQualityState] = useState(QUALITY_PREF.AUTO);

  useEffect(() => {
    setMounted(true);
    setQualityState(readStoredQuality());

    const recompute = () => {
      const signals = collectSignals();
      setReducedMotion(signals.reducedMotion);
      setResolved(resolveTier(signals));
    };
    recompute();

    // Recompute on width / pointer / motion changes (debounced for resize thrash).
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(recompute);
    };
    window.addEventListener('resize', onResize);
    const mqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    mqMotion.addEventListener('change', recompute);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      mqMotion.removeEventListener('change', recompute);
    };
  }, []);

  const setQuality = useCallback((q) => {
    setQualityState(q);
    try {
      localStorage.setItem(QUALITY_STORAGE_KEY, q);
    } catch {
      /* ignore */
    }
  }, []);

  const tier = mounted ? applyOverride(resolved, quality, reducedMotion) : TIER.LOW;
  return { tier, quality, mounted, setQuality };
}

export default useDeviceTier;
