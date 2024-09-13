import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EXPO_PRODUCTION_API_URL, EXPO_PUBLIC_API_URL } from "@env";

const instance = axios.create({ baseURL: EXPO_PUBLIC_API_URL });

const getAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  return token ? `Bearer ${token}` : "";
};

instance.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export function postUser(user) {
  return instance.post("/auth/register", user);
}

export async function loginUser(email, password) {
  try {
    const res = await instance.post("/auth/login", {
      email,
      password,
    });
    const { token, userId, fullname } = res.data.result;
    await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("userId", userId.toString());
    await AsyncStorage.setItem("userName", fullname.toString());
    console.log("UserId stored:", userId);
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
    const res = await instance.delete("/auth/delete-by-email-password", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: {
        email,
        password,
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export function recoverPassword(email) {
  return instance.post("/auth/forgot-password", { email });
}

export function getUser() {
  return instance.get("/api/v1/user");
}

export function postProjects(projectName, startDate, endDate, creatorId) {
  return instance.post("/projects", {
    projectName,
    startDate,
    endDate,
    creatorId,
  });
}

export function deleteProjectFromAPI(projectId) {
  return instance.delete(`/projects/${projectId}`);
}

export function leaveProjectFromAPI(projectId, userId) {
  return instance.delete(`/projects/${projectId}/leave`, {
    data: { userId },
  });
}

export function inviteUserToProjects(projectId, userId) {
  return instance.post(`/projects/${projectId}/invite`, { userId });
}

export function getUserProjects(userId) {
  return instance.get(`/projects/user/${userId}`);
}

export function getInvitedUsers(projectId) {
  return instance.get(`/projects/${projectId}/invited-users`);
}

export function getTasks(projectId, userId) {
  return instance.get(`/tasks/project/${projectId}`, {
    headers: {
      Authorization: `Bearer ${userId}`,
    },
  });
}

export const getAllTasks = async () => {
  return instance.get("/tasks");
};

export function postTasks(
  title,
  projectId,
  description = "",
  assigneeId = null,
  creatorId
) {
  return instance.post(`/tasks`, {
    title,
    projectId,
    description,
    assigneeId,
    creatorId,
  });
}

export function deleteTasks(taskId) {
  return instance.delete(`/tasks/${taskId}`);
}

export const updateTask = async (taskId, status) => {
  const token = await AsyncStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  return instance.patch(`/tasks/${taskId}/status`, { status }, { headers });
};

export const userProfileImage = (userId, imageUrl) => {
  return instance.put(`/api/v1/user/${userId}/profile-image`, { imageUrl });
};

export function getUserById(userId) {
  return instance.get(`/api/v1/user/${userId}`);
}

export function loadImageFromApi(userId) {
  return instance.get(`/api/v1/user/${userId}/profile-image`);
}

export function deleteChat(userId, contactId) {
  return instance.post("/chat/deleteMessages", { userId, contactId });
}

export function fetchMessagesFromAPI(selectedUser, currentUser) {
  return instance.get(
    `/chat/messages?userId=${selectedUser}&contactId=${currentUser}`
  );
}

export function getProjectStatus() {
  return instance.get("/reports/projectStatus");
}

export function getTeamProductivity(startDate, endDate) {
  return instance.get("/reports/teamProductivity", {
    params: { startDate, endDate }
  });
}

export function getBottlenecks() {
  return instance.get("/reports/bottlenecks")
}
