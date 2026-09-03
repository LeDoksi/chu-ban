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
  script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.page.js';
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

export function requestPushPermission(): void {
  pushDeferred(async (OneSignal) => {
    await OneSignal.Notifications.requestPermission();
  });
}
