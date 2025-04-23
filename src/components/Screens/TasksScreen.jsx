import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  LayoutAnimation,
  ActivityIndicator,
  ScrollView,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  postTasks,
  assignTaskToSprint,
  getInvitedUsers,
} from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProject } from "../StoreProjects/ProjectContext";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import ProjectSelector from "../ProjectSelector";
import SprintSelector from "../SprintSelector";
import DropdownSelect from "react-native-input-select";
import Toast from "react-native-toast-message";
import moment from "moment/moment";

const TasksScreen = ({ navigation }) => {
  const [task, setTask] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [sprintId, setSprintId] = useState(null);
  const [selectProjectId, setSelectProjectId] = useState(null);
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [syncingTasks, setSyncingTasks] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [isTaskSectionVisible, setIsTaskSectionVisible] = useState(false);
  const [isSprintSectionVisible, setIsSprintSectionVisible] = useState(false);
  const { projects } = useProject();

  const ongoingProjects = projects.filter((project) =>
    project ? moment().isBefore(moment(project.endDate)) : false
  );

  const projectOptions = ongoingProjects.map((project) => ({
    label: project.projectName,
    value: project.id,
  }));

  const usersOptions = users.map((user) => ({
    label: user.fullname,
    value: user.id,
  }));

  useEffect(() => {
    const fetchInvitedUsers = async () => {
      if (projectId) {
        try {
          const response = await getInvitedUsers(projectId);
          setUsers(response.data);
        } catch (error) {
          console.error("Error al obtener los usuarios invitados:", error);
          Alert.alert(
            "Error",
            "No se pudieron obtener los usuarios invitados para este proyecto."
          );
        }
      }
    };
    fetchInvitedUsers();
  }, [projectId]);

  useEffect(() => {
    const fetchUserId = async () => {
      const id = await AsyncStorage.getItem("userId");
      setUserId(Number(id));
    };
    fetchUserId();
  }, []);

  const addTask = async () => {
    if (task.trim() !== "" && projectId) {
      setIsSyncing(true);
      try {
        setLoading(true);
        const res = await postTasks(
          task,
          projectId,
          description,
          assigneeId ? parseInt(assigneeId) : null,
          userId,
          sprintId
        );
        const createdTaskId = res.data.id;
        setSyncingTasks([...syncingTasks, createdTaskId]);
        setTasks([...tasks, res.data]);

        Toast.show({
          type: "success",
          text1: "Done",
          text2: "Task created successfully!",
          autoHide: true,
          position: "top",
        });

        setTask("");
        setProjectId(null);
        setDescription("");
        setAssigneeId("");
        setError("");

        if (sprintId) {
          try {
            await assignTaskToSprint(createdTaskId, sprintId);
            console.log("Tarea asignada al sprint exitosamente.");
          } catch (error) {
            console.error("Error al asignar tarea al sprint:", error);
            if (error.response) {
              const { status, data } = error.response;
              if (status === 403) {
                Dialog.show({
                  type: ALERT_TYPE.WARNING,
                  title: "Forbidden Exception",
                  textBody: data.message,
                  button: "Close",
                });
              } else if (status === 404) {
                Dialog.show({
                  type: ALERT_TYPE.WARNING,
                  title: "Sprint not found",
                  textBody: "Make sure the sprint exists.",
                  button: "Close",
                });
              } else {
                Dialog.show({
                  type: ALERT_TYPE.WARNING,
                  title: "Unexpected Error",
                  textBody:
                    "An unexpected error occurred while assigning the task to the sprint.",
                  button: "Close",
                });
              }
            }
          }
        }
        setTimeout(() => {
          setSyncingTasks((prev) => prev.filter((id) => id !== createdTaskId));
          setIsSyncing(false);
        }, 2000);
      } catch (error) {
        console.log(error);
        if (error.response) {
          const { status, data } = error.response;
          if (status === 403) {
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: "Forbidden Exception",
              textBody: data.message,
              button: "close",
            });
          } else if (status === 404) {
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: "Not Found Exception",
              textBody: data.message,
              button: "close",
            });
          } else {
            Dialog.show({
              type: ALERT_TYPE.WARNING,
              title: "Unexpected Error",
              textBody: "An unexpected error occurred while creating the task.",
              button: "Close",
            });
          }
        }
        setSyncingTasks(syncingTasks.filter((id) => id !== "temp-task-id"));
        setIsSyncing(false);
      } finally {
        setLoading(false);
      }
    } else {
      setError("Task title and Project ID are required");
    }
  };

  const handleTaskChange = (text) => {
    setTask(text);
    if (text.trim() !== "" && projectId) {
      setError("");
    }
  };

  const handleSelectProject = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (selectProjectId === id) {
      setSelectProjectId(null);
      setSprintId(null);
    } else {
      setSelectProjectId(id);
      setSprintId(null);
    }
  };

  const handleSelectSprint = (id) => {
    setSprintId(id);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() =>
            navigation.navigate("TaskList", {
              userId,
              syncingTasks,
            })
          }
          disabled={isSyncing}
        >
          <MaterialIcons
            name="view-list"
            size={24}
            color={isSyncing ? "gray" : "black"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, userId, syncingTasks, isSyncing]);

  return (
    <AlertNotificationRoot>
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={["white", "white"]}
          style={styles.headerGradient}
        >
          <Text style={styles.headerText}>New Task</Text>
        </LinearGradient>
        <Toast />
        <View style={styles.formContainer}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsTaskSectionVisible(!isTaskSectionVisible)}
          >
            <Text style={styles.sectionHeaderText}>Task Details</Text>
            <Feather
              name={isTaskSectionVisible ? "chevron-up" : "chevron-down"}
              size={24}
              color="#ff9400"
            />
          </TouchableOpacity>

          {isTaskSectionVisible && (
            <View style={styles.sectionContent}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Task Title*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter task title"
                  onChangeText={handleTaskChange}
                  value={task}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Project*</Text>
                <DropdownSelect
                  placeholder="Select a Project"
                  options={projectOptions}
                  selectedValue={projectId}
                  onValueChange={(value) => setProjectId(value)}
                  primaryColor="#4c669f"
                  containerStyle={styles.dropdownContainer}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter task description"
                  onChangeText={(text) => setDescription(text)}
                  value={description}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Assignee</Text>
                <DropdownSelect
                  placeholder="Select an Assignee"
                  options={usersOptions}
                  selectedValue={assigneeId}
                  onValueChange={(value) => setAssigneeId(value)}
                  primaryColor="#4c669f"
                  containerStyle={styles.dropdownContainer}
                />
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setIsSprintSectionVisible(!isSprintSectionVisible)}
          >
            <Text style={styles.sectionHeaderText}>Sprint Details</Text>
            <Feather
              name={isSprintSectionVisible ? "chevron-up" : "chevron-down"}
              size={24}
              color="#ff9400"
            />
          </TouchableOpacity>

          {isSprintSectionVisible && (
            <View style={styles.sectionContent}>
              <Text style={styles.label}>Select Project:</Text>
              <ProjectSelector
                onSelectProject={handleSelectProject}
                selectProjectId={selectProjectId}
              />

              {selectProjectId && (
                <>
                  <Text style={styles.label}>Select Sprint:</Text>
                  <SprintSelector
                    projectId={selectProjectId}
                    onSelectSprint={handleSelectSprint}
                    selectedSprintId={sprintId}
                  />
                </>
              )}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={addTask}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Add Task</Text>
            )}
          </TouchableOpacity>

          {error !== "" && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setModalVisible(true)}
          >
            <Feather name="help-circle" size={24} color="#4c669f" />
            <Text style={styles.helpButtonText}>How it works</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>How does it work?</Text>
              <Text style={styles.modalSubtitle}>Roles:</Text>
              <Text style={styles.modalText}>
                • Product Owner: Modify and delete any task.
              </Text>
              <Text style={styles.modalText}>
                • Scrum Master: Modify tasks, but not delete others' tasks.
              </Text>
              <Text style={styles.modalText}>
                • Developer: Only modify or delete your own tasks.
              </Text>
              <Text style={styles.modalNote}>
                Note: Developers cannot assign tasks to others or sprints.
              </Text>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
  },
  headerGradient: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "black",
  },
  sectionContent: {
    backgroundColor: "#ffffff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4c669f",
    marginBottom: 5,
  },
  input: {
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownContainer: {
    backgroundColor: "#f0f2f5",
    borderRadius: 8,
  },
  addButton: {
    padding: 10,
    paddingVertical: 15,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#2196F3",
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ff3b30",
    textAlign: "center",
    marginTop: 10,
  },
  helpButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  helpButtonText: {
    color: "#4c669f",
    marginLeft: 5,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#4c669f",
    marginBottom: 15,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4c669f",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#333333",
    marginBottom: 5,
    textAlign: "left",
    alignSelf: "stretch",
  },
  modalNote: {
    fontSize: 14,
    color: "#ff3b30",
    marginTop: 15,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#4c669f",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 30,
    marginTop: 20,
  },
  modalButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TasksScreen;
