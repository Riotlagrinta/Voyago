'use client';

import { useGuestSession } from '@/hooks/useGuestSession';

export default function GuestSessionInit() {
  useGuestSession();
  return null;
}
