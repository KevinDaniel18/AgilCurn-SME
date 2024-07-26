import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from "react-native";
import { useProject } from "../StoreProjects/ProjectContext";
import { inviteUserToProjects } from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast } from "react-native-toast-message/lib/src/Toast";

const ProjectsScreen = ({ navigation }) => {
  const { projects, deleteProject, leaveProject } = useProject();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitedUserId, setInvitedUserId] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(Number(storedUserId));
    };

    fetchUserId();
  }, []);

  const handleDeleteProject = (index) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  const confirmDeleteProject = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      deleteProject(selectedIndex);
      await AsyncStorage.removeItem("projectId")
      setShowModal(false);
    }
  };

  const handleInviteUser = (index) => {
    setSelectedIndex(index);
    setShowInviteModal(true);
  };

  const handleLeaveProject = async(index) => {
    setSelectedIndex(index);
    await AsyncStorage.removeItem("projectId")
    setShowModal(true);
  };

  const confirmInviteUser = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      const projectId = projects[selectedIndex].id;
      try {
        await inviteUserToProjects(projectId, invitedUserId);
        alert("User invited successfully!");
        setShowInviteModal(false);
        setInvitedUserId("");
      } catch (error) {
       if(error.response && error.response.status === 400){
        Toast.show({
          type: "info",
          text1: "Failed to inviting user",
          text2: "Make sure you entered User ID",
          autoHide: false,
          position: "bottom"
        });
       }
      }
    }
  };

  const confirmLeaveProject = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      const projectId = projects[selectedIndex].id;
      try {
        await leaveProject(projectId, userId);
        alert("You have left the project.");
        setShowModal(false);
      } catch (error) {
        console.error("Error leaving project:", error);
        alert("Failed to leave project. Please try again.");
      }
    }
  };

  const handleViewUsers = (index) => {
    if (projects[index]) {
      const projectId = projects[index].id;
      navigation.navigate("UserListScreen", { projectId });
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {projects.length > 0 ? (
          <View>
            {projects.map((project, index) => (
              <View key={index} style={styles.projectContainer}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.projectName}</Text>
                </View>
                <View style={styles.buttonGroup}>
                  <Button
                    title="View Users"
                    onPress={() => handleViewUsers(index)}
                    color="#007AFF"
                  />
                  {project.creatorId === userId ? (
                    <>
                      <Button
                        title="Invite"
                        onPress={() => handleInviteUser(index)}
                        color="#007AFF"
                      />
                      <Button
                        title="Delete"
                        onPress={() => handleDeleteProject(index)}
                        color="#FF3B30"
                      />
                    </>
                  ) : (
                    <Button
                      title="Leave"
                      onPress={() => handleLeaveProject(index)}
                      color="#FF3B30"
                    />
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.textStyle}>There are no projects yet.</Text>
        )}
      </ScrollView>
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateProjects")}
      >
        <Text style={styles.createButtonText}>Create Project</Text>
      </TouchableOpacity>

      {/* Delete/Leave Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              {selectedIndex !== null &&
              projects[selectedIndex] &&
              projects[selectedIndex].creatorId === userId
                ? "Are you sure you want to delete this project?"
                : "Are you sure you want to leave this project?"}
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#FF3B30" }]}
                onPress={
                  selectedIndex !== null &&
                  projects[selectedIndex] &&
                  projects[selectedIndex].creatorId === userId
                    ? confirmDeleteProject
                    : confirmLeaveProject
                }
              >
                <Text style={styles.modalButtonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E5E5E5" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalButtonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Invite Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showInviteModal}
        onRequestClose={() => setShowInviteModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Enter User ID to invite:</Text>
            <TextInput
              style={styles.input}
              value={invitedUserId}
              onChangeText={setInvitedUserId}
              keyboardType="numeric"
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#007AFF" }]}
                onPress={confirmInviteUser}
              >
                <Text style={styles.modalButtonText}>Invite</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E5E5E5" }]}
                onPress={() => setShowInviteModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Toast/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  projectContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginBottom: 10,
    padding: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  projectInfo: {
    marginBottom: 10,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textStyle: {
    textAlign: "center",
    fontSize: 16,
    color: "#666666",
    marginTop: 20,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
    marginVertical: 10,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "80%",
    padding: 20,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#333333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#DDDDDD",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
});

export default ProjectsScreen;
