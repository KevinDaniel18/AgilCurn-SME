import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const loadToken = async ()=>{
      const storedToken = await AsyncStorage.getItem("token")
      if(storedToken){
        setToken(storedToken)
        setIsLoggedIn(true)
      }
      setLoading(false)
    }
    loadToken()
  }, [])

  const login = async(newToken) => {
    setToken(newToken);
    setIsLoggedIn(true);
    await AsyncStorage.setItem("token", newToken);
  };

  const logout = async() => {
    setToken("");
    setIsLoggedIn(false);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("projects")
    await AsyncStorage.removeItem("userId")
    await AsyncStorage.removeItem("userName")
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
