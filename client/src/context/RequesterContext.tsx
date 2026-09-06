import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface RequesterUser {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
}

interface RequesterContextType {
  currentRequester: RequesterUser | null;
  requesters: RequesterUser[];
  setCurrentRequester: (user: RequesterUser) => void;
  isLoading: boolean;
}

const RequesterContext = createContext<RequesterContextType | undefined>(undefined);

export const RequesterProvider = ({ children }: { children: ReactNode }) => {
  const [requesters, setRequesters] = useState<RequesterUser[]>([]);
  const [currentRequester, setCurrentRequesterState] = useState<RequesterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/requesters')
      .then((res) => res.json())
      .then((data: RequesterUser[]) => {
        if (!Array.isArray(data)) return;
        setRequesters(data);

        let savedId: string | null = null;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            savedId = window.localStorage.getItem('toktickit_requester_id');
          }
        } catch {
          // Ignore localStorage errors
        }

        // เลือก user ที่เคยบันทึกไว้ หรือ default เป็น Active user คนแรก
        const initialUser = data.find((u) => (savedId ? u.id === Number(savedId) && u.isActive : u.isActive));
        if (initialUser) {
          setCurrentRequesterState(initialUser);
        }
      })
      .catch((err) => console.error('Error loading requesters:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const setCurrentRequester = (user: RequesterUser) => {
    setCurrentRequesterState(user);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('toktickit_requester_id', user.id.toString());
      }
    } catch {
      // Ignore localStorage errors
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