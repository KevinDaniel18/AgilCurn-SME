import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { useProject } from "./StoreProjects/ProjectContext";
import { postProjects } from "../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AlerModal from "./modal/AlertModal";

const CreateProjects = () => {
  const [projectName, setProjectName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errorModal, setErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { addProject } = useProject();

  const onChangeStartDate = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartPicker(false);
    setStartDate(currentDate);
  };

  const onChangeEndDate = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndPicker(false);
    setEndDate(currentDate);
  };

  function validateDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setErrorMessage("The start date cannot be in the past.");
      return false;
    }

    if (endDate < startDate) {
      setErrorMessage("The end date cannot be before the start date.");
      return false;
    }

    return true;
  }

  const validateProjectName = () => {
    const minLength = 3;
    if (projectName.trim().length < minLength) {
      setErrorMessage(
        `The project name must be at least ${minLength} characters.`
      );
      return false;
    }
    return true;
  };

  const handleConfirmAndCreate = async () => {
    if (!projectName.trim() !== "" && startDate && endDate) {
      if (!validateProjectName()) {
        setErrorModal(true);
        return;
      }

      if (!validateDate()) {
        setErrorModal(true);
        return;
      }

      try {
        setLoading(true);
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          throw new Error("User ID is not available");
        }

        const response = await postProjects(
          projectName,
          startDate,
          endDate,
          parseInt(userId)
        );
        const createdProject = {
          ...response.data,
          startDate: new Date(response.data.startDate),
          endDate: new Date(response.data.endDate),
        };

        addProject(createdProject);
        setProjectName("");
        setStartDate(new Date());
        setEndDate(new Date());
      } catch (error) {
        console.error("Creating project:", error.message);
      } finally {
        setLoading(false);
      }

      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Now you can see the status of your project in dashboard",
        button: "close",
      });
      addProject({ projectName, startDate, endDate });
      setProjectName("");
      setStartDate(new Date());
      setEndDate(new Date());
    } else {
      setErrorMessage("All fields are required.");
      setErrorModal(true);
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            placeholder="e.g., Project 1"
            value={projectName}
            onChangeText={(text) => setProjectName(text)}
            style={styles.input}
          />
          <Text style={styles.helperText}>
            Enter a descriptive name for the project.
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartPicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {startDate.toDateString()}
            </Text>
            <MaterialCommunityIcons
              name="calendar-start"
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <Text style={styles.helperText}>The start date of the project.</Text>
        </View>

        {showStartPicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            is24Hour={false}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
          />
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndPicker(true)}
          >
            <Text style={styles.dateButtonText}>{endDate.toDateString()}</Text>
            <MaterialCommunityIcons
              name="calendar-end"
              size={24}
              color="#007AFF"
            />
          </TouchableOpacity>
          <Text style={styles.helperText}>The project end date.</Text>
        </View>
        {showEndPicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
          />
        )}

        <View
          style={{ backgroundColor: "white", padding: 20, borderRadius: 10 }}
        >
          <Text style={{ color: "gray" }}>
            Your Project {projectName} starts on {startDate.toLocaleString()}{" "}
            and ends on {endDate.toLocaleString()}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.createButton}
          onPress={handleConfirmAndCreate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Confirm and create</Text>
          )}
        </TouchableOpacity>
      </View>
      <AlerModal
        visible={errorModal}
        onClose={() => setErrorModal(false)}
        message={errorMessage}
      />
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F5",
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "black",
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
    color: "#333",
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
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
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButton: {
    backgroundColor: "#2196F3",
    borderRadius: 5,
    padding: 10,
    elevation: 2,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default CreateProjects;
