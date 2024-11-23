import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useProject } from "../StoreProjects/ProjectContext";
import { inviteUserToProjects } from "../../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";
import DropdownSelect from "react-native-input-select";
import { useRoute } from "@react-navigation/native";

const ProjectsScreen = ({ navigation }) => {
  const { projects, deleteProject, leaveProject } = useProject();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [invitedUser, setInvitedUser] = useState("");
  const [roleId, setRoleId] = useState("");
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const route = useRoute();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(Number(storedUserId));
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (route.params?.showInviteModal) {
      setShowInviteModal(true);
    }
  }, [route.params]);

  const handleDeleteProject = (index) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  const confirmDeleteProject = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      deleteProject(selectedIndex);
      await AsyncStorage.removeItem("projectId");
      setShowModal(false);
    }
  };

  const handleInviteUser = (index) => {
    setSelectedIndex(index);
    setShowInviteModal(true);
  };

  const handleLeaveProject = async (index) => {
    setSelectedIndex(index);
    await AsyncStorage.removeItem("projectId");
    setShowModal(true);
  };

  const confirmInviteUser = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      const projectId = projects[selectedIndex].id;
      console.log(
        "Inviting user with ID:",
        invitedUser,
        "to project:",
        projectId,
        "with role ID:",
        roleId
      );

      try {
        setLoading(true);
        const isEmail = invitedUser.includes("@");
        await inviteUserToProjects(
          projectId,
          Number(roleId),
          isEmail ? null : Number(invitedUser),
          isEmail ? invitedUser : null
        );
        setShowInviteModal(false);
        setShowSuccessToast(true);
        setInvitedUser("");
        setRoleId("");
      } catch (error) {
        if (error.response) {
          const { status, data } = error.response;
          console.log("Status:", status);
          if (status === 500) {
            Toast.show({
              type: "error",
              text1: "Server Error",
              text2: "An unexpected error occurred. Please try again later.",
              autoHide: false,
              position: "top",
            });
          } else if (status === 409) {
            Toast.show({
              type: "info",
              text1: "Invitation Conflict",
              text2:
                data.message ||
                "The user has already been invited or has confirmed the invitation.",
              autoHide: true,
              position: "top",
            });
          } else if (status === 404) {
            Toast.show({
              type: "error",
              text1: "Failed to inviting user",
              text2: "User ID or email does not exist",
              autoHide: false,
              position: "top",
            });
          } else if (status === 400) {
            console.log(data.message);
            Toast.show({
              type: "info",
              text1: "Invalid Operation",
              text2:
                data.message ||
                "You cannot invite yourself to your own project.",
              autoHide: true,
              position: "top",
            });
          }
        } else {
          console.error("Network or unexpected error:", error);
          Toast.show({
            type: "error",
            text1: "Network Error",
            text2: "Unable to connect. Please check your internet connection.",
            autoHide: true,
            position: "top",
          });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (showSuccessToast) {
      Toast.show({
        type: "success",
        text1: "Done",
        text2: "User invited successfully!",
        autoHide: false,
        position: "top",
      });
      setShowSuccessToast(false);
    }
  }, [showSuccessToast]);

  const confirmLeaveProject = async () => {
    if (selectedIndex !== null && projects[selectedIndex]) {
      const projectId = projects[selectedIndex].id;
      try {
        await leaveProject(projectId, userId);
        Toast.show({
          type: "success",
          text1: "Done",
          text2: "You have left the project.",
          autoHide: false,
          position: "top",
        });
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
      const creatorId = projects[index].creatorId;
      navigation.navigate("UserListScreen", { projectId, creatorId });
    }
  };

  function NavigateToDocuments(index) {
    const projectId = projects[index].id;
    const projectName = projects[index].projectName;
    const creatorId = projects[index].creatorId;
    navigation.navigate("AttachDocuments", {
      projectId,
      projectName,
      creatorId,
    });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {projects.length > 0 ? (
          <View>
            {projects.map((project, index) => (
              <View key={index} style={styles.projectContainer}>
                <View style={styles.projectInfo}>
                  <Text style={styles.projectName}>{project.projectName}</Text>
                </View>
                <View style={styles.buttonGroup}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleViewUsers(index)}
                  >
                    <View style={styles.buttonContent}>
                      <Feather name="users" size={24} color="black" />
                      <Text style={styles.buttonText}>View Users</Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ marginTop: 10 }}
                    onPress={() => NavigateToDocuments(index)}
                  >
                    <View style={styles.buttonContent}>
                      <Ionicons
                        name="document-attach-outline"
                        size={24}
                        color="black"
                      />
                      <Text style={styles.buttonText}>Documents</Text>
                    </View>
                  </TouchableOpacity>
                  {project.creatorId === userId ? (
                    <>
                      <TouchableOpacity
                        style={styles.inviteButton}
                        onPress={() => handleInviteUser(index)}
                      >
                        <View style={styles.buttonContent}>
                          <AntDesign name="adduser" size={24} color="black" />
                          <Text style={styles.buttonText}>Invite</Text>
                        </View>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteProject(index)}
                      >
                        <View style={styles.buttonContent}>
                          <MaterialIcons
                            name="delete-forever"
                            size={24}
                            color="black"
                          />
                          <Text style={styles.buttonText}>Delete</Text>
                        </View>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.leaveButton}
                      onPress={() => handleLeaveProject(index)}
                    >
                      <View style={styles.buttonContent}>
                        <Ionicons name="exit-outline" size={24} color="black" />
                        <Text style={styles.buttonText}>Leave</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.textStyle}>There are no projects yet.</Text>
        )}
      </ScrollView>
      <Toast />

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
        onRequestClose={() => {
          setShowModal(false);
          setShowSuccessToast(true);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedIndex !== null &&
            projects[selectedIndex] &&
            projects[selectedIndex].creatorId === userId ? (
              <>
                <Text style={styles.modalTitle}>
                  Are you sure you want to delete this project?
                </Text>
                <Text style={{ marginBottom: 10 }}>
                  All related data will be deleted, such as tasks, reports, etc.
                </Text>
              </>
            ) : (
              <Text style={styles.modalContent}>
                Are you sure you want to leave this project?
              </Text>
            )}
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
          <Toast />
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Enter User ID or Email to invite:
            </Text>
            <TextInput
              style={styles.input}
              value={invitedUser.trim()}
              onChangeText={setInvitedUser}
            />
            <DropdownSelect
              label="Role"
              placeholder="Select an option..."
              options={[
                { label: "Product Owner", value: 1 },
                { label: "Scrum Master", value: 2 },
                { label: "Developer/Invited", value: 3 },
              ]}
              selectedValue={roleId}
              onValueChange={(value) => setRoleId(value)}
              primaryColor={"green"}
              dropdownStyle={{ borderWidth: 0 }}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#007AFF" }]}
                onPress={confirmInviteUser}
                disabled={!invitedUser.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text
                    style={[
                      styles.modalButtonText,
                      { opacity: invitedUser.trim() ? 1 : 0.5 },
                    ]}
                  >
                    Invite
                  </Text>
                )}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f2f5",
    paddingHorizontal: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalContent: {
    fontSize: 16,
    color: "#666",
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
  viewButton: { marginTop: 10 },
  inviteButton: { marginTop: 10 },
  deleteButton: { marginTop: 10 },
  leaveButton: { marginTop: 10 },
  buttonContent: {
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 13,
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
