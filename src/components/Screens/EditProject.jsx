import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useProject } from "../StoreProjects/ProjectContext";
import moment from "moment";
import EditSprintModal from "../modal/EditSprintModal";

export default function EditProject({ route, navigation }) {
  const {
    projectId,
    projectName,
    projectStartDate: projectStart,
    projectEndDate: projectEnd,
  } = route.params;

  const [changeProjectName, setChangeProjectName] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { updateProjectById } = useProject();
  const [renderSprintConflict, setRenderSprintConflict] = useState([]);
  const [projectStartDate, setProjectStartDate] = useState(new Date());
  const [projectEndDate, setProjectEndDate] = useState(new Date());

  const [editingSprint, setEditingSprint] = useState(null);
  const [, setEditSprintName] = useState("");
  const [, setEditStartDate] = useState(new Date());
  const [, setEditEndDate] = useState(new Date());
  const [hasConflicts, setHasConflicts] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  useEffect(() => {
    if (projectName && projectStart && projectEnd) {
      setChangeProjectName(projectName);
      setStartDate(new Date(projectStart));
      setEndDate(new Date(projectEnd));
    }
  }, [projectName, projectStart, projectEnd]);

  useEffect(() => {
    setProjectStartDate(startDate);
    setProjectEndDate(endDate);
  }, [startDate, endDate]);

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

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setEditSprintName(sprint.sprintName);
    setEditStartDate(new Date(sprint.startDate));
    setEditEndDate(new Date(sprint.endDate));
    setIsEditModalVisible(true);
  };

  const handleSaveSprintEdit = (updatedSprint) => {
    setRenderSprintConflict((prev) =>
      prev.map((sprint) =>
        sprint.id === updatedSprint.id ? updatedSprint : sprint
      )
    );
    setIsEditModalVisible(false);
    setEditingSprint(null);
  };

  const checkForConflicts = () => {
    const hasAny = renderSprintConflict.some(({ startDate, endDate }) => {
      return (
        new Date(startDate) < projectStartDate ||
        new Date(endDate) > projectEndDate
      );
    });
    setHasConflicts(hasAny);
  };

  useEffect(() => {
    checkForConflicts();
  }, [renderSprintConflict, projectStartDate, projectEndDate]);

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
    if (changeProjectName.trim().length < minLength) {
      setErrorMessage(
        `The project name must be at least ${minLength} characters.`
      );
      return false;
    }
    return true;
  };

  async function confirmAndUpdate() {
    setErrorMessage("");
    const isDateValid = validateDate();
    const isNameValid = validateProjectName();

    if (!isDateValid || !isNameValid) return;

    try {
      setLoading(true);

      const projectPayload = {
        projectName: changeProjectName.trim(),
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        sprints: renderSprintConflict.map((sprint) => ({
          id: sprint.id,
          sprintName: sprint.sprintName,
          startDate: new Date(sprint.startDate).toISOString(),
          endDate: new Date(sprint.endDate).toISOString(),
        })),
      };

      const res = await updateProjectById(projectId, projectPayload);
      console.log("Proyecto actualizado correctamente:", res.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.sprints) {
        console.log(
          "Debes modificar estos sprints primero:",
          error.response.data.sprints
        );
        setErrorMessage(error.response.data.message);
        setRenderSprintConflict(error.response.data.sprints);
      } else {
        console.error("Error al actualizar el proyecto:", error);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{flex: 1}}>
      <View style={styles.header}>
        <View style={styles.normalHeader}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.titleHeader}>Edit Project</Text>
          <View style={{ width: 24 }} />
        </View>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Project Name</Text>
          <TextInput
            placeholder="e.g., Project 1"
            value={changeProjectName}
            onChangeText={(text) => setChangeProjectName(text)}
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

        <View style={styles.projectSummary}>
          <Text style={styles.summaryText}>
            Your Project <Text style={styles.highlightText}>{projectName}</Text>{" "}
            starts on{" "}
            <Text style={styles.highlightText}>
              {" "}
              {moment(startDate).format("MMM DD, YYYY")}
            </Text>{" "}
            and ends on{" "}
            <Text style={styles.highlightText}>
              {" "}
              {moment(endDate).format("MMM DD, YYYY")}
            </Text>
          </Text>
        </View>

        {renderSprintConflict.length > 0 && (
          <View style={styles.sprintsContainer}>
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#FFF"
              />
              <Text style={styles.errorBannerText}>
                Sprint date conflicts detected
              </Text>
            </View>

            <Text style={styles.errorDescription}>
              The following sprints have start dates that occur before the new
              project start date. Please adjust these sprints before continuing.
            </Text>

            {renderSprintConflict.map(
              ({ id, sprintName, startDate, endDate }) => {
                const isConflict =
                  new Date(startDate) < projectStartDate ||
                  new Date(endDate) > projectEndDate;

                return (
                  <View key={id} style={styles.sprintCard}>
                    <View style={styles.sprintHeader}>
                      <View style={styles.sprintNameContainer}>
                        <MaterialCommunityIcons
                          name="run-fast"
                          size={20}
                          color="#007AFF"
                        />
                        <Text style={styles.sprintName}>{sprintName}</Text>
                      </View>
                      <View
                        style={[
                          styles.conflictBadge,
                          isConflict
                            ? {
                                backgroundColor: "#FFEBE9",
                                borderColor: "#FFCDD2",
                              }
                            : {
                                backgroundColor: "#E6F4EA",
                                borderColor: "#A5D6A7",
                              },
                        ]}
                      >
                        <Text
                          style={[
                            styles.conflictBadgeText,
                            { color: isConflict ? "#D32F2F" : "#2E7D32" },
                          ]}
                        >
                          {isConflict ? "Conflict" : "Resolved"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.sprintDates}>
                      <View style={styles.dateItem}>
                        <Feather name="calendar" size={16} color="#555" />
                        <View>
                          <Text style={styles.dateLabel}>Start Date</Text>
                          <Text style={styles.dateValue}>
                            {moment(startDate).format("MMM DD, YYYY")}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.dateItem}>
                        <Feather name="calendar" size={16} color="#555" />
                        <View>
                          <Text style={styles.dateLabel}>End Date</Text>
                          <Text style={styles.dateValue}>
                            {moment(endDate).format("MMM DD, YYYY")}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.editSprintButton}
                      onPress={() =>
                        handleEditSprint({ id, sprintName, startDate, endDate })
                      }
                    >
                      <Text style={styles.editSprintButtonText}>
                        Edit Sprint
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              }
            )}
          </View>
        )}

        <TouchableOpacity
          style={styles.createButton}
          onPress={confirmAndUpdate}
          disabled={loading || hasConflicts}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.createButtonText}>
              {hasConflicts
                ? "Resolve Conflicts to Continue"
                : "Confirm and Update"}
            </Text>
          )}
        </TouchableOpacity>

        <EditSprintModal
          isVisible={isEditModalVisible}
          sprint={editingSprint}
          onClose={() => {
            setIsEditModalVisible(false);
            setEditingSprint(null);
          }}
          onSave={handleSaveSprintEdit}
          projectStartDate={startDate}
          projectEndDate={endDate}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 10,
  },
  normalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  titleHeader: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f7fa",
    padding: 16,
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
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  helperText: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
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
  projectSummary: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#007AFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryText: {
    color: "#555",
    fontSize: 15,
    lineHeight: 22,
  },
  highlightText: {
    color: "#007AFF",
    fontWeight: "600",
  },
  sprintsContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorBanner: {
    backgroundColor: "#FF3B30",
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  errorBannerText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    marginLeft: 8,
  },
  errorDescription: {
    padding: 16,
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sprintCard: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  sprintHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sprintNameContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sprintName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 8,
  },
  conflictBadge: {
    backgroundColor: "#FFEBE9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  conflictBadgeText: {
    color: "#D32F2F",
    fontSize: 12,
    fontWeight: "600",
  },
  sprintDates: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: "#666",
    marginLeft: 8,
  },
  dateValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    marginLeft: 8,
  },
  editSprintButton: {
    backgroundColor: "#F0F4FF",
    borderWidth: 1,
    borderColor: "#D0D9FF",
    borderRadius: 8,
    padding: 10,
    alignItems: "center",
  },
  editSprintButtonText: {
    color: "#3D5AFE",
    fontWeight: "600",
    fontSize: 14,
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginBottom: 30,
  },
  createButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});
