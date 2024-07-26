import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
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
import Toast from "react-native-toast-message";

const TasksScreen = () => {
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState(null);
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
        if (error.response && error.response.status === 403) {
          Toast.show({
            type: "error",
            text1: "Project not found",
            text2: "Make sure you own or belong to a project",
            autoHide: false,
            position: "bottom"
          });
        }
      }
    } else {
      console.error("Task title and Project ID are required");
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Add New Task</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter task title"
        onChangeText={(text) => setTask(text)}
        value={task}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter project ID"
        onChangeText={(text) => setProjectId(text)}
        value={projectId}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Enter description (optional)"
        onChangeText={(text) => setDescription(text)}
        value={description}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter assignee ID (optional)"
        onChangeText={(text) => setAssigneeId(text)}
        value={assigneeId}
        keyboardType="numeric"
      />

      <Button title="Add Task" onPress={addTask} color="#007bff" />

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
      <Toast />
    </View>
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
  taskDetail: {
    fontSize: 14,
    color: "#666",
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 30,
  },
});

export default TasksScreen;
