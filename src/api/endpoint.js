import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export function postUser(user) {
  const res = axios.post("http://192.168.1.6:3000/auth/register", user);
  return res;
}

export async function loginUser(email, password) {
  try {
    const res = await axios.post("http://192.168.1.6:3000/auth/login", {
      email,
      password,
    });
    const token = res.data.result.token;
    await AsyncStorage.setItem("token", token);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteAccountByEmailAndPassword(email, password, token) {
  try {
    const storedToken = await AsyncStorage.getItem("token");
    if (token !== storedToken) {
      throw new Error("Unauthorized action. Token mismatch.");
    }
    const response = await fetch(
      "http://192.168.1.6:3000/auth/delete-by-email-password",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password }),
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export function recoverPassword(email) {
  const res = axios.post("http://192.168.1.6:3000/auth/forgot-password", {
    email,
  });
  return res;
}

export function getUser() {
  const res = axios.get("http://192.168.1.6:3000/api/v1/user");
  return res;
}
