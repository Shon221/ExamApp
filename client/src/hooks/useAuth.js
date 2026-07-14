import { useEffect, useState } from 'react';
import { AuthService } from '../services';

export function useAuth() {
  const auth = AuthService.getInstance();
  const [authState, setAuthState] = useState(auth.getAuthState());

  useEffect(() => auth.subscribe(setAuthState), [auth]);

  const { user, isLoading } = authState;

  return {
    user,
    isLoading,
    isAuthenticated: user !== null,
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    login: auth.login.bind(auth),
    register: auth.register.bind(auth),
    logout: auth.logout.bind(auth),
  };
}
