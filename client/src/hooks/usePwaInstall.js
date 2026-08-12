import { useState, useEffect, useCallback } from 'react';

/**
 * Chrome/Edge/Android fire 'beforeinstallprompt' when the app is installable
 * but suppress their own UI unless we call preventDefault() and store the
 * event to trigger later (e.g. from a custom button). Safari/iOS never fire
 * this event at all — there's no scriptable install API there, so we detect
 * that case separately and show manual instructions instead.
 */
export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setInstalled(standalone);

    const ua = window.navigator.userAgent;
    const iOS = /iphone|ipad|ipod/i.test(ua);
    const safari = /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
    setIsIos(iOS && safari && !standalone);

    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return outcome === 'accepted';
  }, [deferredPrompt]);

  // Only offer the button when we can actually do something useful with it:
  // a real install prompt (Chrome/Edge/Android), or iOS instructions.
  const canOfferInstall = !installed && (Boolean(deferredPrompt) || isIos);

  return { canOfferInstall, canPromptDirectly: Boolean(deferredPrompt), isIos, installed, promptInstall };
}
