import axios from "axios";

export function postUser(user) {
  const res = axios.post("http://127.0.0.1:8000/api/v1/users/", user);
  return res;
}
