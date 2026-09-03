importScripts('https://cdn.onesignal.com/sdks/OneSignalSDKWorker.js');

import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
