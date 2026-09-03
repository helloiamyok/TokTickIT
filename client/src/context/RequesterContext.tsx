import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface RequesterUser {
  id: number;
  name: string;
  email: string;
  isActive?: boolean;
}

interface RequesterContextType {
  currentRequester: RequesterUser | null;
  requesters: RequesterUser[];
  setCurrentRequester: (user: RequesterUser | null) => void;
  isLoading: boolean;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

const safeGetStorage = (key: string): string | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage.getItem(key);
    }
  } catch {
    // ignore
  }
  return null;
};

const safeSetStorage = (key: string, value: string) => {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.setItem === 'function') {
      window.localStorage.setItem(key, value);
    }
  } catch {
    // ignore
  }
};

export const RequesterProvider = ({ children }: { children: ReactNode }) => {
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [currentRequester, setCurrentRequesterState] = useState<RequesterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3000/api/requesters')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then((data: any) => {
        if (Array.isArray(data)) {
          setRequesters(data);
          const savedId = safeGetStorage('toktickit_requester_id');
          if (savedId === 'none') {
            setCurrentRequesterState(null);
          } else {
            const initialUser = data.find((u) => (savedId ? u.id === Number(savedId) : u.isActive !== false));
            if (initialUser) {
              setCurrentRequesterState(initialUser);
            } else if (data.length > 0) {
              setCurrentRequesterState(data[0]);
            }
          }
        }
      })
      .catch((err) => {
        console.error('Error loading requesters:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setCurrentRequester = (user: RequesterUser | null) => {
    setCurrentRequesterState(user);
    if (user) {
      safeSetStorage('toktickit_requester_id', user.id.toString());
    } else {
      safeSetStorage('toktickit_requester_id', 'none');
    }
  };

  return (
    <RequesterContext.Provider value={{ currentRequester, requesters, setCurrentRequester, isLoading }}>
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = () => {
  const context = useContext(RequesterContext);
  if (!context) {
    throw new Error('useRequester must be used within a RequesterProvider');
  }
  return context;
};