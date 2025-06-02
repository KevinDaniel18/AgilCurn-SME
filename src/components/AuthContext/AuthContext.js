import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const loadToken = async () => {
      const adminToken = await AsyncStorage.getItem("adminToken");
      const userToken = await AsyncStorage.getItem("token");

      if (adminToken) {
        setToken(adminToken);
        setUserType("admin");
        setIsLoggedIn(true);
      } else if (userToken) {
        setToken(userToken);
        setUserType("user");
        setIsLoggedIn(true);
      }

      setLoading(false);
    };
    loadToken();
  }, []);

  const login = async (newToken) => {
    setToken(newToken);
    setUserType("user");
    setIsLoggedIn(true);
    await AsyncStorage.setItem("token", newToken);
  };

  const loginAsAdmin = async (newToken) => {
    setToken(newToken);
    setUserType("admin");
    setIsLoggedIn(true);
    await AsyncStorage.setItem("adminToken", newToken);
  };

  const logout = async () => {
    setToken("");
    setIsLoggedIn(false);
    setUserType(null);
    await AsyncStorage.multiRemove([
      "token",
      "adminToken",
      "projects",
      "userId",
      "userName",
    ]);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isLoggedIn,
        login,
        loginAsAdmin,
        logout,
        loading,
        userType,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
