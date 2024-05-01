import axios from "axios";

export function postUser(user) {
  const res = axios.post("http://192.168.1.10:3000/auth/register", user);
  return res;
}

export async function loginUser(email, password) {
  try {
    const res = await axios.post("http://192.168.1.10:3000/auth/login", {
      email,
      password,
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export function deleteAccount(email, password, userId) {
  return axios.delete(
    "http://192.168.1.10:3000/auth/delete-by-email-password",
    { data: { email, password, userId } }
  );
}

export function recoverPassword(email) {
  const res = axios.post("http://192.168.1.10:3000/auth/forgot-password", {
    email,
  });
  return res;
}

export function getUser() {
  const res = axios.get("http://192.168.1.10:3000/api/v1/user");
  return res;
}
