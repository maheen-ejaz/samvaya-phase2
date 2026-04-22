'use client';

import { useServiceWorker } from '@/lib/app/use-service-worker';

export function ServiceWorkerRegistration() {
  useServiceWorker();
  return null;
}
