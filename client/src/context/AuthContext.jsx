// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userPhone, setUserPhone] = useState(() => {
    return localStorage.getItem("userPhone") || "";
  });

  const login = (phone) => {
    localStorage.setItem("userPhone", phone);
    setUserPhone(phone);
  };

  const logout = () => {
    localStorage.removeItem("userPhone");
    setUserPhone("");
  };

  return (
    <AuthContext.Provider value={{ userPhone, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
