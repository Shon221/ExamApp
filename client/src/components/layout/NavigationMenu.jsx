import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../../entities';
import { useAuth } from '../../hooks/useAuth';
import { ConfigService } from '../../services';
import './NavigationMenu.css';

export function NavigationMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const appName = ConfigService.getInstance().get('appName');

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const teacherLinks = [
    { to: '/teacher', label: 'Dashboard', end: true },
    { to: '/teacher/exams', label: 'My Exams' },
    { to: '/teacher/submissions', label: 'Submissions' },
  ];

  const studentLinks = [
    { to: '/student', label: 'Dashboard', end: true },
    { to: '/student/exams', label: 'Available Exams' },
    { to: '/student/grades', label: 'My Grades' },
  ];

  const links = user.role === UserRole.Teacher ? teacherLinks : studentLinks;

  return (
    <nav className="nav-menu">
      <div className="nav-menu__brand">
        <span className="nav-menu__logo">📋</span>
        <span className="nav-menu__title">{appName}</span>
      </div>
      <ul className="nav-menu__links">
        {links.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) => (isActive ? 'nav-link nav-link--active' : 'nav-link')}
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-menu__user">
        <span className="nav-menu__name">{user.fullName}</span>
        <span className="nav-menu__role">{user.role}</span>
        <button type="button" className="btn btn--outline btn--sm" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
