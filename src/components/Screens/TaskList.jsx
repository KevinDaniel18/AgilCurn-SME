import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LogBox,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Feather } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { deleteTasks, getAllTasks } from "../../api/endpoint";

const TaskList = () => {
  const route = useRoute();
  const { userId, syncingTasks } = route.params;

  const [currentTasks, setCurrentTasks] = useState([]);
  const [scaleAnims, setScaleAnims] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
  ]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async (showAlert = true) => {
    try {
      setLoading(true);
      const res = await getAllTasks();
      setCurrentTasks(res.data);

      const anims = {};
      res.data.forEach((task) => {
        anims[task.id] = new Animated.Value(1);
      });
      setScaleAnims(anims);
    } catch (error) {
      if (showAlert && error.response && error.response.status === 403) {
        Alert.alert(
          "Error",
          "No se pudieron obtener las tareas. Asegúrate de que el ID del proyecto es correcto y que estás invitado al proyecto.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks(false);
    setRefreshing(false);
  };

  const deleteTask = async (index) => {
    const taskId = currentTasks[index].id;

    Alert.alert(
      "Confirm Deletion",
      "¿Are you sure you want to delete this task?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const taskScaleAnim = scaleAnims[taskId];

            Animated.timing(taskScaleAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(async () => {
              try {
                const response = await deleteTasks(taskId);

                if (response.status === 200) {
                  setCurrentTasks((prevTasks) =>
                    prevTasks.filter((task) => task.id !== taskId)
                  );

                  await fetchTasks();

                  setScaleAnims((prevAnims) => {
                    const newAnims = { ...prevAnims };
                    delete newAnims[taskId];
                    return newAnims;
                  });
                } else {
                  console.error("Error al eliminar la tarea:", response);
                }
              } catch (error) {
                console.error("Error eliminando la tarea:", error);
              }
            });
          },
        },
      ]
    );
  };

  return (
    <View style={{ padding: 20, backgroundColor: "#F0F0F5", }}>
      {loading ? (
        <ActivityIndicator size="large" color="black" />
      ) : currentTasks.length > 0 ? (
        <FlatList
          style={styles.list}
          data={currentTasks}
          renderItem={({ item, index }) => (
            <Animated.View
              style={{
                transform: [
                  { scale: scaleAnims[item.id] || new Animated.Value(1) },
                ],
              }}
            >
              <View style={styles.taskContainer}>
                <View style={styles.taskDetails}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskDetail}>
                    Project: {item.project.projectName}
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
                    disabled={syncingTasks.includes(item.id)}
                  >
                    <Feather
                      name="trash"
                      size={24}
                      color={
                        syncingTasks.includes(item.id) ? "#d3d3d3" : "#ff6b6b"
                      }
                    />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>
          )}
          keyExtractor={(item, index) => index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      ) : (
        <Text style={{ textAlign: "center", color: "gray" }}>
          No tasks available.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default TaskList;
