import { useEffect, useState } from 'react';
import { NotifyService } from '../services';
import type { INotification } from '../services';

export function useNotifications() {
  const notify = NotifyService.getInstance();
  const [notifications, setNotifications] = useState<INotification[]>([]);

  useEffect(() => notify.subscribe(setNotifications), [notify]);

  return {
    notifications,
    dismiss: notify.dismiss.bind(notify),
  };
}
