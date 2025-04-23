import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { postSprint } from "../../api/endpoint";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useProject } from "../StoreProjects/ProjectContext";
import DropdownSelect from "react-native-input-select";
import { TouchableOpacity } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";
import moment from "moment/moment";
import SuccessModal from "../modal/SuccesModal";
import AlerModal from "../modal/AlertModal";

const SprintPlanning = ({ navigation }) => {
  const [sprintName, setSprintName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [errorModal, setErrorModal] = useState(false);
  const [sucessModal, setSucessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [sucessMessage, setSucessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { projects } = useProject();

  const selectedProject = projects.find(
    (project) => project.id === selectedProjectId
  );

  const ongoingProjects = projects.filter((project) =>
    project ? moment().isBefore(moment(project.endDate)) : false
  );

  const projectOptions = ongoingProjects.map((project) => ({
    label: project.projectName,
    value: project.id,
  }));

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

  const validateSprintName = () => {
    const minLength = 3;
    if (sprintName.trim().length < minLength) {
      setErrorMessage(
        `The sprint name must be at least ${minLength} characters.`
      );
      return false;
    }
    return true;
  };

  function validateDate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate <= today) {
      setErrorMessage("The start date cannot be in the past.");
      return false;
    }

    if (endDate < startDate) {
      setErrorMessage("The end date cannot be before the start date.");
      return false;
    }

    if (selectedProject && endDate > new Date(selectedProject.endDate)) {
      setErrorMessage(
        "The sprint end date cannot be greater than the project end date."
      );
      return false;
    }

    return true;
  }

  const createSprint = async () => {
    if (sprintName.trim() !== "" && startDate && endDate && selectedProjectId) {
      if (!validateSprintName()) {
        setErrorModal(true);
        return;
      }

      if (!validateDate()) {
        setErrorModal(true);
        return;
      }
      try {
        setLoading(true);
        await postSprint({
          sprintName,
          startDate: startDate,
          endDate: endDate,
          projectId: selectedProjectId,
        });
        setSucessMessage("Sprint created successfully");
        setSucessModal(true);
        setSprintName("");
        setStartDate(new Date());
        setEndDate(new Date());
        setSelectedProjectId(null);
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
    } else {
      setErrorMessage("All fields are required.");
      setErrorModal(true);
    }
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{ marginRight: 10 }}
          onPress={() => navigation.navigate("SprintList")}
        >
          <MaterialIcons name="view-list" size={24} />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={["white", "white"]} style={styles.headerGradient}>
        <Text style={styles.headerText}>Sprint Planning</Text>
      </LinearGradient>
      <View style={{ padding: 20 }}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project</Text>
          <DropdownSelect
            placeholder="Select a Project"
            options={projectOptions}
            selectedValue={selectedProjectId}
            onValueChange={(value) => setSelectedProjectId(value)}
            primaryColor={"green"}
            dropdownStyle={{ borderWidth: 0 }}
            listControls={{ emptyListMessage: "No projects available" }}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Sprint Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sprint 1"
            value={sprintName}
            onChangeText={setSprintName}
          />
          <Text style={styles.helperText}>
            Enter a descriptive name for the sprint.
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
          <Text style={styles.helperText}>The start date of the sprint.</Text>
        </View>

        {showStartPicker && (
          <DateTimePicker
            testID="startDatePicker"
            value={startDate}
            is24Hour={false}
            mode="date"
            display="default"
            onChange={onChangeStartDate}
            minimumDate={new Date()}
            maximumDate={
              selectedProject ? new Date(selectedProject.endDate) : undefined
            }
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
          <Text style={styles.helperText}>The sprint end date.</Text>
        </View>
        {showEndPicker && (
          <DateTimePicker
            testID="endDatePicker"
            value={endDate}
            mode="date"
            display="default"
            onChange={onChangeEndDate}
            minimumDate={new Date()}
            maximumDate={
              selectedProject ? new Date(selectedProject.endDate) : undefined
            }
          />
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={createSprint}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>Create Sprint</Text>
          )}
        </TouchableOpacity>

        <AlerModal
          visible={errorModal}
          onClose={() => setErrorModal(false)}
          message={errorMessage}
        />
        <SuccessModal
          visible={sucessModal}
          onClose={() => setSucessModal(false)}
          message={sucessMessage}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F0F5",
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
    fontSize: 18,
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

export default SprintPlanning;
