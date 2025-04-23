import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useState, useContext, useEffect } from "react";
import { getUserById } from "../../api/endpoint";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function getUser() {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) return;
        const parseId = Number(userId);
        setUserId(parseId);

        const user = await getUserById(parseId);

        return user.data
      } catch (error) {
        console.error(error);
      }
    }
    getUser();
  }, []);

  return (
    <UserContext.Provider value={{ userId }}>{children}</UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
