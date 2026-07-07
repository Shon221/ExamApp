import { useNotifications } from '../../hooks/useNotifications';
import './NotificationToast.css';

export function NotificationToast() {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {notifications.map((n) => (
        <div key={n.id} className={`toast toast--${n.type}`}>
          <span>{n.message}</span>
          <button type="button" className="toast__close" onClick={() => dismiss(n.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
