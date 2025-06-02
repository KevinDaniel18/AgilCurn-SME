import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../config";

const instance = axios.create({ baseURL: config.api.baseUrl });
const adminInstance = axios.create({ baseURL: config.api.baseUrl });

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

const getAdminAuthToken = async () => {
  const token = await AsyncStorage.getItem("adminToken");
  return token ? `Bearer ${token}` : "";
};

adminInstance.interceptors.request.use(
  async (config) => {
    const token = await getAdminAuthToken();
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
    return res.data;
  } catch (error) {
    console.log("error login user:", error);
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

export function updateProject(projectId, data) {
  return instance.patch(`/projects/${projectId}`, data);
}

export function deleteProjectFromAPI(projectId) {
  return instance.delete(`/projects/${projectId}`);
}

export function leaveProjectFromAPI(projectId, userId) {
  return instance.delete(`/projects/${projectId}/leave`, {
    data: { userId },
  });
}

export function inviteUserToProjects(projectId, roleId, userId, email) {
  return instance.post(`/projects/${projectId}/invite`, {
    roleId,
    userId,
    email,
  });
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
  creatorId,
  sprintId
) {
  return instance.post(`/tasks`, {
    title,
    projectId,
    description,
    assigneeId,
    creatorId,
    sprintId,
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

export function getTeamProductivity(projectId, startDate, endDate) {
  return instance.get("/reports/teamProductivity", {
    params: { projectId, startDate, endDate },
  });
}

export function getBottlenecks() {
  return instance.get("/reports/bottlenecks");
}

export function sendTokenToBackend(expoPushToken) {
  try {
    const res = instance.post("/chat/save-token", { token: expoPushToken });
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadDocument(projectId, formData) {
  try {
    const response = await instance.post(
      `/projects/${projectId}/documents/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading document:", error.response);
    throw error;
  }
}

export const getProjectDocuments = async (projectId) => {
  try {
    const response = await instance.get(`/projects/${projectId}/documents`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project documents:", error);
    throw error;
  }
};

export const deleteDocument = async (projectId, documentId) => {
  try {
    await instance.delete(`/projects/${projectId}/documents/${documentId}`);
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

export function getDocumentDownloadUrl(projectId, documentId) {
  return `${instance.defaults.baseURL}/projects/${projectId}/documents/${documentId}/download`;
}

export function postSprint(sprintData) {
  return instance.post("/tasks/sprints", sprintData);
}

export function getSprints(projectId) {
  return instance.get(`tasks/${projectId}/sprints`);
}

export function assignTaskToSprint(taskId, sprintId) {
  return instance.post(`tasks/${taskId}/assign-to-sprint`, { sprintId });
}

export function removeTaskFromSprint(taskId) {
  return instance.post(`tasks/${taskId}/remove-from-sprint`);
}

export function deleteSprint(sprintId) {
  return instance.delete(`tasks/${sprintId}/delete-sprint`);
}

export function loginAdmin(admin) {
  return instance.post("/admin/auth/login", admin);
}

export function createTicket(ticket) {
  return instance.post("/support/create", ticket);
}

export function getAllTickets() {
  return adminInstance.get("/admin/auth/support/all");
}

export function updateTicketStatus(id, status) {
  return adminInstance.patch(`/admin/auth/support/${id}/status/${status}`);
}

export function respondToTicket(respond) {
  return adminInstance.post("/admin/auth/support/respond", respond);
}

export function getResponsesByTicket(ticketId) {
  return adminInstance.get(`/admin/auth/support/${ticketId}/responses`);
}
export function getResponsesByTicketUser(ticketId) {
  return instance.get(`/support/${ticketId}/responses`);
}

export function respondToTicketUser(respond) {
  return instance.post("/support/respond", respond);
}

export function getUserTickets() {
  return instance.get("/support/my-tickets");
}
