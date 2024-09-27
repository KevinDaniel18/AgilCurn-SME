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
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, updateTask } from "../../api/endpoint";
import { Spinner } from "./ReportScreen";

const BoardScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("TODO");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

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

  useEffect(() => {
    const initializeProjects = async () => {
      await fetchProjects();
    };
    initializeProjects();
  }, []);

  const fetchTasks = async () => {
    if (selectedProjectId) {
      if (isInitialLoading) setIsLoading(true);
      try {
        const res = await getTasks(selectedProjectId);
        setTasks(res.data);
      } catch (error) {
        setTasks([]);
      } finally {
        setIsLoading(false);
        if (isInitialLoading) setIsInitialLoading(false);
      }
    }
  };

  useEffect(() => {
    const initializeTasks = async () => {
      if (selectedProjectId) {
        await fetchTasks();
      }
    };
    initializeTasks();
  }, [selectedProjectId]);

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
      {projects.length > 0 ? (
        <View>
          <Text style={styles.header}>Select Project:</Text>
          <FlatList
            data={projects}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.projectItem,
                  selectedProjectId === item.id ? styles.selectedProject : null,
                ]}
                onPress={() => handleProjectSelect(item.id)}
              >
                <Text style={styles.projectName}>{item.projectName}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <Text style={styles.textStyle}>There are no projects available.</Text>
      )}

      {selectedProjectId ? (
        isLoading && isInitialLoading ? (
          <Spinner />
        ) : tasks.length === 0 ? (
          <Text style={styles.textStyle}>
            {filter === "TODO" && "There are no tasks to do for this project"}
            {filter === "IN_PROGRESS" &&
              "There are no tasks in progress for this project"}
            {filter === "DONE" && "There are no tasks done for this project"}
          </Text>
        ) : (
          <>
            {tasks.length > 0 && renderFilterButtons()}
            {filteredTasks.length > 0 ? (
              <FlatList
                data={filteredTasks}
                renderItem={({ item }) => (
                  <View style={styles.taskContainer}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Text style={styles.taskTitle}>{item.title}</Text>

                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Image
                          source={{ uri: item.creator?.profileImage }}
                          style={[styles.profileImage, { zIndex: 1 }]}
                        />

                        {item.assignee && (
                          <Image
                            source={{ uri: item.assignee.profileImage }}
                            style={[
                              styles.profileImage,
                              { marginLeft: -20, zIndex: 0 },
                            ]}
                          />
                        )}
                      </View>
                    </View>

                    <Text style={styles.taskStatus}>Status: {item.status}</Text>

                    {(item.creatorId === userId ||
                      item.project.creatorId === userId ||
                      item.assigneeId === userId) && (
                      <View style={styles.buttonContainer}>
                        <Button
                          title="TO DO"
                          onPress={() => updateTaskStatus(item.id, "TODO")}
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
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                  <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
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
        )
      ) : null}
      <TouchableOpacity
        style={{
          backgroundColor: "gray",
          alignItems: "center",
          paddingVertical: 15,
          borderRadius: 10,
          marginVertical: 10,
          position: "absolute",
          bottom: 2,
          left: 20,
          right: 20,
        }}
        onPress={onRefresh}
      >
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>Update</Text>
      </TouchableOpacity>
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
