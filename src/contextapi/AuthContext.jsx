import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Provider component to manage login states and user data
export function AuthProvider({ children }) 
{
  // Load initial state from localStorage or default to false/null
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
  });

  const [isUserLoggedIn, setIsUserLoggedIn] = useState(() => {
    return localStorage.getItem('isUserLoggedIn') === 'true';
  });
  
  const [isManagerLoggedIn, setIsManagerLoggedIn] = useState(() => {
    return localStorage.getItem('isManagerLoggedIn') === 'true';
  });

  // Save state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn);
    localStorage.setItem('isUserLoggedIn', isUserLoggedIn);
    localStorage.setItem('isManagerLoggedIn', isManagerLoggedIn);
  }, [isAdminLoggedIn, isUserLoggedIn, isManagerLoggedIn]);

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isUserLoggedIn,
        setIsUserLoggedIn,
        isManagerLoggedIn,
        setIsManagerLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the context
export const useAuth = () => useContext(AuthContext);