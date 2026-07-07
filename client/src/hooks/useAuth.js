import { useEffect, useState } from 'react';
import { AuthService } from '../services';

export function useAuth() {
  const auth = AuthService.getInstance();
  const [user, setUser] = useState(auth.getUser());

  useEffect(() => auth.subscribe(setUser), [auth]);

  return {
    user,
    isAuthenticated: user !== null,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    login: auth.login.bind(auth),
    register: auth.register.bind(auth),
    logout: auth.logout.bind(auth),
  };
}
