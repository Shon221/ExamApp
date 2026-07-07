import { Outlet } from 'react-router-dom';
import { NotificationToast } from '../common/NotificationToast';
import { NavigationMenu } from './NavigationMenu';
import './AppLayout.css';

export function AppLayout() {
  return (
    <div className="app-layout">
      <NavigationMenu />
      <main className="app-layout__main">
        <Outlet />
      </main>
      <NotificationToast />
    </div>
  );
}
