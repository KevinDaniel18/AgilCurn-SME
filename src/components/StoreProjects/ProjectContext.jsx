import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    loadProjectsFromStorage();
  }, []);

  const loadProjectsFromStorage = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem('projects');
      if (storedProjects) {
        const parsedProjects = JSON.parse(storedProjects);
        const updatedProjects = parsedProjects.map(project => ({
          ...project,
          endDate: project.endDate ? new Date(project.endDate) : new Date(),
          startDate: project.startDate ? new Date(project.startDate) : new Date()
        }));
        setProjects(updatedProjects);
      }
    } catch (error) {
      console.error('Error loading projects from AsyncStorage:', error);
    }
  };

  const saveProjectsToStorage = async (projectsToSave) => {
    try {
      await AsyncStorage.setItem("projects", JSON.stringify(projectsToSave));
    } catch (error) {
      console.error("Error saving projects to AsyncStorage:", error);
    }
  };

  const addProject = (project) => {
    const updatedProjects = [...projects, project];
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  const deleteProject = (index) => {
    const updatedProjects = [...projects];
    updatedProjects.splice(index, 1);
    setProjects(updatedProjects);
    saveProjectsToStorage(updatedProjects);
  };

  return (
    <ProjectContext.Provider value={{ projects, addProject, deleteProject }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => useContext(ProjectContext);
