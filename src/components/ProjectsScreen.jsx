import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useProject } from "./StoreProjects/ProjectContext";

const ProjectsScreen = ({ navigation }) => {
  const { projects, deleteProject } = useProject();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleDeleteProject = (index) => {
    setSelectedIndex(index);
    setShowModal(true);
  };

  const confirmDeleteProject = () => {
    deleteProject(selectedIndex);
    setShowModal(false);
  };

  return (
    <View style={styles.container}>
      {projects.length > 0 ? (
        <View>
          {projects.map((project, index) => (
            <View key={index} style={styles.projectContainer}>
              <Text style={styles.projectName}>{project.projectName}</Text>
              <Button
                title="Delete"
                onPress={() => handleDeleteProject(index)}
                color="#ff6b6b"
              />
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.textStyle}>There are no projects yet.</Text>
      )}
      <Button
        title="Create Project"
        onPress={() => navigation.navigate("CreateProjects")}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>
              Are you sure you want to delete this project?
            </Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ff6b6b" }]}
                onPress={confirmDeleteProject}
              >
                <Text style={styles.buttonText}>Yes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#ccc" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  projectContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 10,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  textStyle: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default ProjectsScreen;
