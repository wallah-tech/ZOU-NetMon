import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'Administrator' | 'Operator' | 'Viewer';

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  initials: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}

// Predefined users — in a real system this would call an API
const USERS: Array<AuthUser & { password: string }> = [
  {
    name: 'Admin User',
    email: 'admin@ict.gov.zw',
    role: 'Administrator',
    initials: 'AU',
    password: 'Admin@2024',
  },
  {
    name: 'Network Operator',
    email: 'netops@ict.gov.zw',
    role: 'Operator',
    initials: 'NO',
    password: 'NetOps@2024',
  },
  {
    name: 'View Only User',
    email: 'viewer@ict.gov.zw',
    role: 'Viewer',
    initials: 'VU',
    password: 'Viewer@2024',
  },
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    // Persist session across hot-reloads in dev
    try {
      const stored = sessionStorage.getItem('ict_netmon_user');
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback(
    (email: string, password: string): { success: boolean; error?: string } => {
      const found = USERS.find(
        (u) =>
          u.email.toLowerCase() === email.toLowerCase().trim() &&
          u.password === password
      );
      if (!found) {
        return { success: false, error: 'Invalid email or password. Please try again.' };
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _pw, ...authUser } = found;
      setUser(authUser);
      sessionStorage.setItem('ict_netmon_user', JSON.stringify(authUser));
      return { success: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem('ict_netmon_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/** Returns which nav views a given role may access */
export function getAllowedViews(role: UserRole): string[] {
  switch (role) {
    case 'Administrator':
      return ['dashboard', 'routers', 'traffic', 'alerts', 'analytics', 'reports', 'settings'];
    case 'Operator':
      return ['dashboard', 'routers', 'traffic', 'alerts', 'analytics', 'reports'];
    case 'Viewer':
      return ['dashboard', 'alerts'];
    default:
      return ['dashboard'];
  }
}
