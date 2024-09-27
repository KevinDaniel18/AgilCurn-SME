import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  getTasks,
  postTasks,
  deleteTasks,
  getAllTasks,
} from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProject } from "../StoreProjects/ProjectContext";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { Spinner } from "./ReportScreen";

const TasksScreen = () => {
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const { projects } = useProject();

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(Number(id));
    };
    fetchUserId();
  }, []);

  useEffect(() => {
    if (projects) {
      fetchTasks(projectId);
    } else {
      setTasks([]);
    }
  }, [projects]);

  const fetchTasks = async (showAlert = true) => {
    try {
      let res;
      if (projectId) {
        const userId = await AsyncStorage.getItem("userId");
        res = await getTasks(parseInt(projectId, 10), Number(userId));
      } else {
        res = await getAllTasks();
      }
      setTasks(res.data);
    } catch (error) {
      if (showAlert && error.response && error.response.status === 403) {
        Alert.alert(
          "Error",
          "No se pudieron obtener las tareas. Asegúrate de que el ID del proyecto es correcto y que estás invitado al proyecto.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(false);
    setRefreshing(false);
  };

  const addTask = async () => {
    if (task.trim() !== "" && projectId.trim() !== "") {
      try {
        const res = await postTasks(
          task,
          parseInt(projectId),
          description,
          assigneeId ? parseInt(assigneeId) : null,
          userId
        );
        setTasks([...tasks, res.data]);
        setTask("");
        setProjectId("");
        setDescription("");
        setAssigneeId("");
        fetchTasks(projectId);
      } catch (error) {
        console.log(error);
        if (error.response && error.response.status === 403) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: "Project not found",
            textBody: "Make sure you own or belong to a project",
            button: "close",
          });
        }
        if (error.response && error.response.status === 500) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: "User ID not found",
            textBody: "Make sure this ID exists",
            button: "close",
          });
        }
      }
    } else {
      setError("Task title and Project ID are required");
    }
  };

  const deleteTask = async (index) => {
    try {
      const taskId = tasks[index].id;
      if (userId) {
        await deleteTasks(taskId);
        const newTasks = [...tasks];
        newTasks.splice(index, 1);
        setTasks(newTasks);
      } else {
        console.error("User ID is not defined");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleTaskChange = (text) => {
    setTask(text);
    if (text.trim() !== "" && projectId.trim() !== "") {
      setError("");
    }
  };

  const handleProjectIdChange = (text) => {
    setProjectId(text);
    if (task.trim() !== "" && text.trim() !== "") {
      setError("");
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.header}>Add New Task</Text>
        <Text style={styles.infoText}>Fields marked * are required.</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter task title*"
          onChangeText={handleTaskChange}
          value={task}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter project ID*"
          onChangeText={handleProjectIdChange}
          value={projectId.trim()}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Enter description (recommended)"
          onChangeText={(text) => setDescription(text)}
          value={description}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter assignee ID (optional)"
          onChangeText={(text) => setAssigneeId(text)}
          value={assigneeId.trim()}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.createTask} onPress={addTask}>
          <Text style={{ color: "white", fontWeight: "bold" }}>Add Task</Text>
        </TouchableOpacity>
        <Text style={{ color: "red", fontSize: 10, textAlign: "center" }}>
          {error}
        </Text>

        {isLoading ? (
          <Spinner />
        ) : tasks.length > 0 ? (
          <FlatList
            style={styles.list}
            data={tasks}
            renderItem={({ item, index }) => (
              <View style={styles.taskContainer}>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDetail}>
                    Project ID: {item.projectId}
                  </Text>
                  <Text style={styles.taskDetail}>
                    Description: {item.description}
                  </Text>
                  <Text style={styles.taskDetail}>
                    Assignee ID: {item.assigneeId}
                  </Text>
                </View>
                {(item.creatorId === userId ||
                  item.project.creatorId === userId) && (
                  <TouchableOpacity
                    style={styles.iconContainer}
                    onPress={() => deleteTask(index)}
                  >
                    <Feather name="trash" size={24} color="#ff6b6b" />
                  </TouchableOpacity>
                )}
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        ) : (
          <Text style={{textAlign: "center", color:"gray"}}>No tasks available.</Text>
        )}
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
  },
  list: {
    marginTop: 20,
  },
  taskContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "500",
  },
  infoText: {
    fontSize: 11,
    color: "#666",
  },
  taskDetail: {
    fontSize: 14,
    color: "#666",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
  },
  createTask: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 10,
  },
});

export default TasksScreen;
