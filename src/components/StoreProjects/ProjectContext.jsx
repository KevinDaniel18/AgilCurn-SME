import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  deleteProjectFromAPI,
  getUserById,
  leaveProjectFromAPI,
  userProfileImage,
  updateProject,
} from "../../api/endpoint";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    loadProjectsFromStorage();
    loadProfileImageFromStorage();
  }, []);

  const loadProjectsFromStorage = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        const updatedProjects = parsedProjects.map((project) => ({
          ...project,
          endDate: project.endDate ? new Date(project.endDate) : new Date(),
          startDate: project.startDate
            ? new Date(project.startDate)
            : new Date(),
        }));
        setProjects(updatedProjects);
      }
    } catch (error) {
      console.error("Error loading projects from AsyncStorage:", error);
    }
  };

  const loadProfileImageFromStorage = async () => {
    const userId = await AsyncStorage.getItem("userId");
    if (userId) {
      const res = await getUserById(userId);
      setProfileImage(res.data.profileImage);
    }
  };
  const saveProfileImageToStorage = async (imageUri) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      //await AsyncStorage.setItem("profileImage", imageUri);
      await userProfileImage(Number(userId), imageUri);
      setProfileImage(imageUri);
    } catch (error) {
      console.error("Error saving profile image:", error);
    }
  };

  const saveProjectsToStorage = async (projectsToSave) => {
    try {
      await AsyncStorage.setItem("projects", JSON.stringify(projectsToSave));
    } catch (error) {
      console.error("Error saving projects to AsyncStorage:", error);
    }
  };

  const addProject = async (project) => {
    if (!project.id) return;

    const formattedProject = {
      ...project,
      startDate: new Date(project.startDate),
      endDate: new Date(project.endDate),
    };

    const updatedProjects = [...projects, formattedProject];
    setProjects(updatedProjects);
    await saveProjectsToStorage(updatedProjects);
  };

  const updateProjectById = async (projectId, updatedData) => {
    try {
      const response = await updateProject(projectId, updatedData);
      console.log("Respuesta del backend:", response.data);
      const updatedProject = {
        ...response.data,
        startDate: new Date(response.data.startDate),
        endDate: new Date(response.data.endDate),
      };

      const updatedProjects = projects.map((project) =>
        project.id === projectId ? { ...project, ...updatedProject } : project
      );

      setProjects(updatedProjects);
      await saveProjectsToStorage(updatedProjects);
      return updatedProject;
    } catch (error) {
      console.error(
        "Error updating project:",
        error?.response?.data || error?.message || error
      );

      throw error;
    }
  };

  const deleteProject = async (index) => {
    try {
      const projectToDelete = projects[index];

      if (projectToDelete && projectToDelete.id) {
        await deleteProjectFromAPI(projectToDelete.id);
        const updatedProjects = projects.filter((_, i) => i !== index);
        setProjects(updatedProjects);
        saveProjectsToStorage(updatedProjects);
      }
    } catch (error) {
      console.error(
        "Error deleting project:",
        error.response ? error.response.data : error.message
      );
    }
  };

  const leaveProject = async (projectId, userId) => {
    try {
      await leaveProjectFromAPI(projectId, userId);
      const updatedProjects = projects.filter(
        (project) => project.id !== projectId
      );
      setProjects(updatedProjects);
      await saveProjectsToStorage(updatedProjects);
    } catch (error) {
      console.error("Error leaving project:", error);
    }
  };

  const updateProfileImage = async (uri) => {
    setProfileImage(uri);
    saveProfileImageToStorage(uri);
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        addProject,
        deleteProject,
        setProjects,
        leaveProject,
        profileImage,
        updateProfileImage,
        updateProjectById,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
