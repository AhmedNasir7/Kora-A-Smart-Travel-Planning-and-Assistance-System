'use client';

import { ReactNode } from 'react';
import { ToastContainer } from '@/components/Toast';
import { useNotification } from '@/lib/notification-context';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';

export function AppShell({ children }: { children: ReactNode }) {
  const { toasts, removeToast } = useNotification();
  useReminderNotifications();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
