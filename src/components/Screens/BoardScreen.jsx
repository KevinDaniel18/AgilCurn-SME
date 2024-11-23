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
  Animated,
  Dimensions,
  LayoutAnimation,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTasks, updateTask } from "../../api/endpoint";
import moment from "moment/moment";

const BoardScreen = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("TODO");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [animations, setAnimations] = useState({});
  const width = Dimensions.get("window").width;

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
      setIsLoading(true);
      try {
        const res = await getTasks(selectedProjectId);
        setTasks(res.data);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  const updateTaskStatus = async (taskId, status, currentStatus) => {
    if (currentStatus === status) {
      return;
    }

    const animation = new Animated.Value(0);
    const direction = getAnimationDirection(currentStatus, status);

    setAnimations((prev) => ({ ...prev, [taskId]: animation }));

    Animated.timing(animation, {
      toValue: direction === "right" ? 1 : -1,
      duration: 300,
      useNativeDriver: true,
    }).start(async () => {
      try {
        const userRole = tasks
          .find((task) => task.id === taskId)
          ?.project.userRoles.find((userRole) => userRole.userId === userId);

        if (!userRole) {
          console.error();
          ("You are not part of this project");
        }

        const roleId = userRole.roleId;

        if (roleId === 1 || roleId === 2) {
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
          return;
        }

        const task = tasks.find((task) => task.id === taskId);
        if (task && (task.creatorId === userId || task.assigneeId === userId)) {
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
          return;
        }
        throw new Error("You are not authorized to update this task.");
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
      } finally {
        animation.setValue(0);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }
    });
  };

  const getAnimationDirection = (currentStatus, status) => {
    if (currentStatus === "TODO" && status === "IN_PROGRESS") {
      return "right";
    } else if (currentStatus === "IN_PROGRESS" && status === "TODO") {
      return "left";
    } else if (currentStatus === "IN_PROGRESS" && status === "DONE") {
      return "right";
    } else if (currentStatus === "TODO" && status === "DONE") {
      return "right";
    } else if (currentStatus === "DONE" && status === "IN_PROGRESS") {
      return "left";
    } else if (currentStatus === "DONE" && status === "TODO") {
      return "left";
    }
    return null;
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

  const renderTaskItem = (item) => {
    const animation = animations[item.id] || new Animated.Value(0);
    return (
      <Animated.View
        style={{
          transform: [
            {
              translateX: animation.interpolate({
                inputRange: [-1, 0, 1],
                outputRange: [-width, 0, width],
              }),
            },
          ],
        }}
      >
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
              style={{
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Image
                source={
                  item.creator?.profileImage
                    ? { uri: item.creator?.profileImage }
                    : require("../../../assets/defaultProfile.jpg")
                }
                style={[styles.profileImage, { zIndex: 1 }]}
              />

              {item.assignee && (
                <Image
                  source={
                    item.assignee.profileImage
                      ? { uri: item.assignee.profileImage }
                      : require("../../../assets/defaultProfile.jpg")
                  }
                  style={[styles.profileImage, { marginLeft: -20, zIndex: 0 }]}
                />
              )}
            </View>
          </View>

          <Text style={styles.taskStatus}>Status: {item.status}</Text>
          {renderTaskButtons(item)}
        </View>
      </Animated.View>
    );
  };

  const renderTaskButtons = (task) => {
    const userRole = task.project.userRoles.find(
      (role) => role.userId === userId
    );

    const isSprintOver = task.sprint
      ? moment().isAfter(moment(task.sprint.endDate))
      : false;

    if (userRole) {
      const { roleId } = userRole;

      if (
        roleId === 1 ||
        roleId === 2 ||
        (roleId === 3 &&
          (task.creatorId === userId || task.assigneeId === userId))
      ) {
        return (
          <View>
            {isSprintOver && (
              <Text style={styles.sprintOverMessage}>
                The sprint for this task has ended.
              </Text>
            )}
            <View style={styles.buttonContainer}>
              <Button
                title="TO DO"
                onPress={() =>
                  !isSprintOver &&
                  updateTaskStatus(task.id, "TODO", task.status)
                }
                disabled={isSprintOver}
              />
              <Button
                title="In Progress"
                onPress={() =>
                  !isSprintOver &&
                  updateTaskStatus(task.id, "IN_PROGRESS", task.status)
                }
                color="#f4a261"
                disabled={isSprintOver}
              />
              <Button
                title="Done"
                onPress={() =>
                  !isSprintOver &&
                  updateTaskStatus(task.id, "DONE", task.status)
                }
                color="#2a9d8f"
                disabled={isSprintOver}
              />
            </View>
          </View>
        );
      }

      return (
        <Text style={styles.textStyle}>
          You do not have permission to change the status of this task.
        </Text>
      );
    }

    return null;
  };

  const filteredTasks = tasks.filter((task) => task.status === filter);

  return (
    <View style={styles.container}>
      {projects.length > 0 ? (
        <View>
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
                <View style={{ flexDirection: "row", gap: 4 }}>
                  {selectedProjectId === item.id && (
                    <AntDesign name="right" size={24} color="black" />
                  )}
                  <Text style={styles.projectName}>{item.projectName}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      ) : (
        <Text style={styles.textStyle}>There are no projects available.</Text>
      )}
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {selectedProjectId ? (
          <>
            {isLoading && !refreshing ? (
              <ActivityIndicator
                size="large"
                color="black"
                style={{ marginTop: 20 }}
              />
            ) : tasks.length === 0 ? (
              <Text style={styles.textStyle}>
                {filter === "TODO" &&
                  "There are no tasks to do for this project"}
                {filter === "IN_PROGRESS" &&
                  "There are no tasks in progress for this project"}
                {filter === "DONE" &&
                  "There are no tasks done for this project"}
              </Text>
            ) : (
              <>
                {tasks.length > 0 && renderFilterButtons()}
                {filteredTasks.length > 0 ? (
                  <View style={{ paddingBottom: 100 }}>
                    {filteredTasks.map((item) => (
                      <View key={item.id}>{renderTaskItem(item)}</View>
                    ))}
                  </View>
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
          </>
        ) : null}
      </ScrollView>
      <TouchableOpacity style={styles.updateButton} onPress={onRefresh}>
        <Text style={{ color: "white", fontWeight: "bold", fontSize: 15 }}>
          Update
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f0f2f5",
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedProject: {
    backgroundColor: "#e0f7fa",
    shadowColor: "#00bcd4",
  },
  projectName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
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
  sprintOverMessage: {
    color: "red",
    marginBottom: 10,
    fontWeight: "bold",
  },
  updateButton: {
    backgroundColor: "gray",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 10,
    position: "absolute",
    bottom: 2,
    left: 20,
    right: 20,
  },
});

export default BoardScreen;
