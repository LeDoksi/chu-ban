export interface OneSignalSdk {
  init(options: {
    appId: string;
    serviceWorkerPath?: string;
    serviceWorkerParam?: { scope: string };
  }): Promise<void>;
  login(externalId: string): Promise<void>;
  logout(): Promise<void>;
  Notifications: {
    requestPermission(): Promise<void>;
  };
}

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: OneSignalSdk) => void>;
  }
}

function pushDeferred(callback: (OneSignal: OneSignalSdk) => void): void {
  window.OneSignalDeferred = window.OneSignalDeferred || [];
  window.OneSignalDeferred.push(callback);
}

export function loadOneSignal(): void {
  if (document.getElementById('onesignal-sdk')) return;
  const script = document.createElement('script');
  script.id = 'onesignal-sdk';
  // Unversioned cdn.onesignal.com/sdks/OneSignalSDK.page.js 404s now — OneSignal
  // moved the Web SDK under a versioned path. Same for the worker-side import
  // in sw.ts. This was the actual reason "Включить уведомления" hung forever:
  // the script never loaded, so window.OneSignalDeferred never drained.
  script.src = 'https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js';
  script.defer = true;
  document.head.appendChild(script);

  pushDeferred(async (OneSignal) => {
    await OneSignal.init({
      appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
      // The app is served from /chu-ban/, not the origin root — both the
      // worker path and its scope must reflect that or OneSignal looks for
      // /sw.js and 404s.
      serviceWorkerPath: 'chu-ban/sw.js',
      serviceWorkerParam: { scope: '/chu-ban/' },
    });
  });
}

export function loginOneSignal(uid: string): void {
  pushDeferred(async (OneSignal) => {
    await OneSignal.login(uid);
  });
}

export type PushPermissionResult = 'granted' | 'denied' | 'unsupported' | 'timeout';

// iOS Safari only exposes the Notification/Push APIs when the site has been
// added to the home screen and opened from there — in a regular tab the
// button's click handler runs fine but silently does nothing, which reads to
// her as "the button isn't clickable". Feature-detect it so we can tell her why.
export function isPushSupported(): boolean {
  return typeof Notification !== 'undefined' && 'serviceWorker' in navigator;
}

export function getPushPermission(): PushPermissionResult | 'default' {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission;
}

export function requestPushPermission(): Promise<PushPermissionResult> {
  if (!isPushSupported()) return Promise.resolve('unsupported');
  return new Promise((resolve) => {
    // The OneSignal script can fail to load entirely — blocked by an ad
    // blocker or VPN, a flaky connection — in which case OneSignalDeferred
    // never drains and the callback below never runs. Without a timeout the
    // button is stuck on "requesting" forever with no way out.
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        resolve('timeout');
      }
    }, 8000);
    pushDeferred(async (OneSignal) => {
      if (settled) return;
      try {
        await OneSignal.Notifications.requestPermission();
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(Notification.permission === 'granted' ? 'granted' : 'denied');
        }
      } catch {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve('timeout');
        }
      }
    });
  });
}
