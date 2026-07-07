import { useEffect, useState } from 'react';
import { NotifyService } from '../services';

export function useNotifications() {
  const notify = NotifyService.getInstance();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => notify.subscribe(setNotifications), [notify]);

  return {
    notifications,
    dismiss: notify.dismiss.bind(notify),
  };
}
