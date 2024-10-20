import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useProject } from "../StoreProjects/ProjectContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import {
  getUserProjects,
  getSprints,
  removeTaskFromSprint,
  deleteSprint,
} from "../../api/endpoint";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Feather from "@expo/vector-icons/Feather";

const SprintList = () => {
  const { projects, setProjects } = useProject();
  const [projectId, setProjectId] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSprints = async () => {
      if (projectId) {
        setLoading(true);
        try {
          const res = await getSprints(projectId);
          setSprints(res.data);
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        } catch (error) {
          console.error("Error fetching sprints: ", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchSprints();
  }, [projectId, projects]);

  useEffect(() => {
    const fetchProjects = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        const response = await getUserProjects(userId);
        const projects = response.data.map((project) => ({
          ...project,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
        }));
        setProjects(projects);
      }
    };
    fetchProjects();
  }, []);

  const handleOpenModal = (tasks) => {
    setTasks(tasks);
    setModalVisible(true);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleRemoveTask = async (taskId) => {
    Alert.alert(
      "Confirm Deletion",
      "¿Are you sure you want to remove this task from the sprint?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await removeTaskFromSprint(taskId);
              setTasks((prevTasks) =>
                prevTasks.filter((task) => task.id !== taskId)
              );
              const res = await getSprints(projectId);
              setSprints(res.data);
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
              console.log(`Task ${taskId} removed from sprint`);
            } catch (error) {
              if (error.response) {
                const { status, data } = error.response;
                if (status === 403) {
                  setErrorMessage(`${data.message}`);
                } else if (status === 404) {
                  setErrorMessage(data.message);
                } else {
                  setErrorMessage(`${data.message}`);
                }
              }

              setErrorModal(true);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  async function handleDeleteSprint(sprintId) {
    Alert.alert(
      "Confirm Deletion",
      "¿Are you sure you want to delete this sprint?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteSprint(sprintId);
              const res = await getSprints(projectId);
              setSprints(res.data);
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut
              );
            } catch (error) {
              if (error.response) {
                const { status, data } = error.response;
                if (status === 403) {
                  setErrorMessage(`${data.message}`);
                } else if (status === 404) {
                  setErrorMessage(data.message);
                } else {
                  setErrorMessage(`${data.message}`);
                }
              }
              setErrorModal(true);
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  const renderTask = ({ item }) => (
    <View style={styles.taskItem}>
      <Text>{item.title}</Text>
      <TouchableOpacity onPress={() => handleRemoveTask(item.id)}>
        <MaterialIcons name="delete-outline" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  const renderSprint = ({ item }) => {
    const timeLeft = moment(item.endDate).fromNow(true);
    const isOverdue = moment().isAfter(item.endDate);

    return (
      <View style={styles.sprintCard}>
        <View style={styles.sprintInfo}>
          <Text style={styles.sprintName}>{item.sprintName}</Text>
          <Text style={styles.dates}>
            {moment(item.startDate).format("MMM DD, YYYY")} -{" "}
            {moment(item.endDate).format("MMM DD, YYYY")}
          </Text>
          <Text style={[styles.counter, isOverdue && styles.overdue]}>
            {isOverdue ? "Sprint finished" : `Ends in: ${timeLeft}`}
          </Text>
        </View>

        <View style={styles.sprintActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleOpenModal(item.tasks)}
          >
            <FontAwesome5 name="tasks" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteSprint(item.id)}
          >
            <Feather name="trash-2" size={20} color="red" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Projects:</Text>
      <View style={styles.projectList}>
        {projects.length > 0 ? (
          projects.map(({ projectName, id }) => (
            <TouchableOpacity
              key={id}
              style={[
                styles.projectButton,
                projectId === id && styles.selectedProjectButton,
              ]}
              onPress={() => setProjectId(id)}
            >
              <Text
                style={[
                  styles.projectText,
                  projectId === id && styles.selectedProjectText,
                ]}
              >
                {projectName}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text>There are no projects yet</Text>
        )}
      </View>

      <Text style={styles.header}>Sprints:</Text>
      {loading ? (
        <ActivityIndicator size="small" color="black" style={styles.loader} />
      ) : !projectId ? (
        <Text style={styles.emptyText}>
          Please select a project to see the sprints.
        </Text>
      ) : sprints.length > 0 ? (
        <FlatList
          data={sprints}
          renderItem={renderSprint}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.sprintList}
        />
      ) : (
        <Text style={styles.emptyText}>
          There are no sprints assigned to this project.
        </Text>
      )}

      <Modal visible={modalVisible} animationType="fade">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Assigned Tasks</Text>
          {loading ? (
            <ActivityIndicator size="small" color="black" />
          ) : tasks.length > 0 ? (
            <FlatList
              data={tasks}
              renderItem={renderTask}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.taskList}
            />
          ) : (
            <Text style={{ color: "gray" }}>
              There are no tasks assigned to this sprint.
            </Text>
          )}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCloseModal}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={errorModal}
        onRequestClose={() => {
          setErrorModal(false);
        }}
      >
        <View style={styles.modalErrorContainer}>
          <View style={styles.modalErrorView}>
            <Text style={styles.modalErrorTitle}>¡Attention!</Text>
            <Text style={styles.modalErrorText}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalErrorButton}
              onPress={() => setErrorModal(false)}
            >
              <Text style={styles.modalErrorButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SprintList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7FAFC",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 16,
  },
  projectList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 24,
    alignSelf: "center",
  },
  projectButton: {
    backgroundColor: "#EDF2F7",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedProjectButton: {
    backgroundColor: "#4299E1",
  },
  projectText: {
    color: "#4A5568",
    fontWeight: "600",
  },
  selectedProjectText: {
    color: "#FFFFFF",
  },
  sprintList: {
    paddingBottom: 16,
  },
  sprintCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sprintInfo: {
    flex: 1,
  },
  sprintName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  dates: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  counter: {
    fontSize: 14,
    color: "#4299E1",
    fontWeight: "600",
  },
  overdue: {
    color: "#E53E3E",
  },
  sprintActions: {
    flexDirection: "row",
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyText: {
    color: "#718096",
    fontSize: 16,
    textAlign: "center",
  },
  loader: {
    marginTop: 24,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  modalErrorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalErrorView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalErrorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalErrorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalErrorButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  modalErrorButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  taskItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  taskList: {
    paddingBottom: 50,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
});
