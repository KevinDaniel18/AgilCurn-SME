import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, updateTask } from "../../api/endpoint";

const BoardScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("TODO");

  const fetchProjects = async () => {
    try {
      const storedProjects = await AsyncStorage.getItem("projects");
      if (storedProjects) {
        const projectsList = JSON.parse(storedProjects);
        setProjects(projectsList);
        if (projectsList.length > 0) {
          setSelectedProjectId(projectsList[0].id);
        } else {
          setSelectedProjectId(null);
        }
      }
    } catch (error) {
      console.error("Error fetching projects from AsyncStorage", error);
    }
  };

  const fetchTasks = async () => {
    if (selectedProjectId) {
      try {
        const res = await getTasks(selectedProjectId);
        setTasks(res.data);
      } catch (error) {
        setTasks([]);
      }
    }
  };

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const user = await AsyncStorage.getItem("userId");
        if (user) {
          setUserId(Number(user));
        }
      } catch (error) {
        console.error("Error fetching user ID", error);
      }
    };
    fetchUserId();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProjects();
    await fetchTasks();
    setRefreshing(false);
  }, [selectedProjectId]);

  useEffect(() => {
    fetchTasks();
  }, [selectedProjectId]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const updateTaskStatus = async (taskId, status) => {
    try {
      const response = await updateTask(taskId, status);
      if (response.data) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId
              ? { ...task, status: response.data.status }
              : task
          )
        );
      } else {
        console.error("Error: No data returned from updateTask");
      }
    } catch (error) {
      let errorMessage = "An error occurred while updating the task.";
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = "You are not authorized to update this task.";
        } else {
          errorMessage = `Error: ${
            error.response.data.message || "An unexpected error occurred."
          }`;
        }
      } else if (error.request) {
        errorMessage = "No response received from the server.";
      }
      Alert.alert("Update Error", errorMessage);
    }
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
  };

  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      {["TODO", "IN_PROGRESS", "DONE"].map((status) => (
        <TouchableOpacity
          key={status}
          style={[
            styles.filterButton,
            filter === status ? styles.selectedFilter : null,
          ]}
          onPress={() => setFilter(status)}
        >
          <Text style={styles.filterText}>{status.replace("_", " ")}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const filteredTasks = tasks.filter((task) => task.status === filter);

  return (
    <View style={styles.container}>
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh}>
        {projects.length > 0 ? (
          <View>
            <Text style={styles.header}>Select Project:</Text>
            <FlatList
              data={projects}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.projectItem,
                    selectedProjectId === item.id
                      ? styles.selectedProject
                      : null,
                  ]}
                  onPress={() => handleProjectSelect(item.id)}
                >
                  <Text style={styles.projectName}>{item.projectName}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        ) : (
          <Text style={styles.textStyle}>There are no projects yet.</Text>
        )}

        {selectedProjectId && tasks.length > 0 && (
          <>
            {renderFilterButtons()}
            {filteredTasks.length > 0 ? (
              <FlatList
                data={filteredTasks}
                renderItem={({ item }) => (
                  <View style={styles.taskContainer}>
                    <Text style={styles.taskTitle}>{item.title}</Text>
                    <Text style={styles.taskStatus}>Status: {item.status}</Text>

                    {(item.creatorId === userId ||
                      item.project.creatorId === userId) && (
                      <View style={styles.buttonContainer}>
                         <Button
                          title="TO DO"
                          onPress={() =>
                            updateTaskStatus(item.id, "TODO")
                          }
                          
                        />
                        <Button
                          title="In Progress"
                          onPress={() =>
                            updateTaskStatus(item.id, "IN_PROGRESS")
                          }
                          color="#f4a261"
                        />
                        <Button
                          title="Done"
                          onPress={() => updateTaskStatus(item.id, "DONE")}
                          color="#2a9d8f"
                        />
                      </View>
                    )}
                  </View>
                )}
              />
            ) : (
              <Text style={styles.textStyle}>
                {filter === "TODO" &&
                  "There are no tasks to do for this project"}
                {filter === "IN_PROGRESS" &&
                  "There are no tasks in progress for this project"}
                {filter === "DONE" &&
                  "There are no tasks done for this project"}
              </Text>
            )}
          </>
        )}
        {selectedProjectId && tasks.length === 0 && (
          <Text style={styles.textStyle}>
            There are no tasks for this project.
          </Text>
        )}
      </RefreshControl>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
  },
  projectItem: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedProject: {
    backgroundColor: "#e0f7fa",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
  },
  taskContainer: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  taskStatus: {
    fontSize: 14,
    color: "#888",
    marginVertical: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  textStyle: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
    marginTop: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  selectedFilter: {
    backgroundColor: "#87ceeb",
  },
  filterText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default BoardScreen;
