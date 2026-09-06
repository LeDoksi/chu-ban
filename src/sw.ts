importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
