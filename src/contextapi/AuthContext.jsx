import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AuthContext = createContext();

// Provider component to manage login states and user data
export function AuthProvider({ children }) {
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

  // Load user data from localStorage
  const [userData, setUserData] = useState(() => {
    const savedUser = localStorage.getItem('userData');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Save all auth states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('isAdminLoggedIn', isAdminLoggedIn);
    localStorage.setItem('isUserLoggedIn', isUserLoggedIn);
    localStorage.setItem('isManagerLoggedIn', isManagerLoggedIn);
  }, [isAdminLoggedIn, isUserLoggedIn, isManagerLoggedIn]);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (userData) {
      localStorage.setItem('userData', JSON.stringify(userData));
    } else {
      localStorage.removeItem('userData');
    }
  }, [userData]);

  // Clear all auth data (for logout)
  const clearAuthData = () => {
    setIsAdminLoggedIn(false);
    setIsUserLoggedIn(false);
    setIsManagerLoggedIn(false);
    setUserData(null);
    localStorage.removeItem('isAdminLoggedIn');
    localStorage.removeItem('isUserLoggedIn');
    localStorage.removeItem('isManagerLoggedIn');
    localStorage.removeItem('userData');
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminLoggedIn,
        setIsAdminLoggedIn,
        isUserLoggedIn,
        setIsUserLoggedIn,
        isManagerLoggedIn,
        setIsManagerLoggedIn,
        userData,
        setUserData,
        clearAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to access the context
export const useAuth = () => useContext(AuthContext);