import React, { useState } from "react";
import { View, TextInput, StyleSheet, Button, Text } from "react-native";
import { Octicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { useProject } from "./StoreProjects/ProjectContext";
import { postProjects } from "../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TouchableOpacity } from "react-native-gesture-handler";

const CreateProjects = () => {
  const [projectName, setProjectName] = useState("");
  const [projectNameFocus, setProjectNameFocus] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [mode, setMode] = useState("date");
  const [dateType, setDateType] = useState("");
  const [warningShow, setWarningShow] = useState(false);
  const { addProject } = useProject();

  const handleProjectNameFocus = () => {
    setProjectNameFocus(true);
    setWarningShow(false);
  };

  const handleDate = (e, selectDate) => {
    if (dateType === "start") {
      setStartDate(selectDate);
    } else if (dateType === "end") {
      setEndDate(selectDate);
    }
    setShowDate(false);
  };

  const showMode = (modeToShow) => {
    setShowDate(true);
    setMode(modeToShow);
  };

  const handleDateSelection = (type) => {
    setDateType(type);
    showMode("date");
  };

  const handleValidate = () => {
    if (projectName.trim() === "") {
      if (!warningShow) {
        setWarningShow(true);
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Warning",
          textBody: "Your project needs a name",
          button: "close",
        });
      }
      return false;
    }

    if (startDate.getTime() >= endDate.getTime()) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Warning",
        textBody: "Start date cannot be equal to or greater than end date",
        button: "close",
      });
      return false;
    }

    return true;
  };

  const handleConfirmAndCreate = async () => {
    if (handleValidate()) {
      try {
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

        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Invitation sent successfully!",
          button: "close",
        });

        // Agregar el proyecto al contexto
        addProject(createdProject);
        setProjectName("");
        setStartDate(new Date());
        setEndDate(new Date());
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: "Success",
          textBody: "Emails sent to users!",
          button: "close",
        });
      } catch (error) {
        console.error("Error sending invitations:", error.message);
        Dialog.show({
          type: ALERT_TYPE.ERROR,
          title: "Error",
          textBody: "Failed to send invitations",
          button: "close",
        });
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
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <View
          style={[styles.inputContainer, projectNameFocus && styles.inputFocus]}
        >
          <Octicons name="project" size={24} color="black" />
          <TextInput
            placeholder="Project Name"
            value={projectName}
            onChangeText={(text) => setProjectName(text)}
            onFocus={handleProjectNameFocus}
            style={styles.input}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={{
              backgroundColor: "#5cdb95",
              padding: 15,
              borderRadius: 15,
            }}
            onPress={() => handleDateSelection("start")}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Select a start date
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={{
              backgroundColor: "#ff6b6b",
              padding: 15,
              borderRadius: 15,
            }}
            onPress={() => handleDateSelection("end")}
          >
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Select an end date
            </Text>
          </TouchableOpacity>
        </View>
        {showDate && (
          <DateTimePicker
            value={dateType === "start" ? startDate : endDate}
            mode={mode}
            is24Hour={false}
            onChange={handleDate}
          />
        )}
        <Text style={styles.dateText}>
          Your Project <Text style={styles.projectName}>{projectName}</Text>{" "}
          starts on {startDate.toLocaleString()} and ends on{" "}
          {endDate.toLocaleString()}
        </Text>
        <TouchableOpacity
          style={{
            backgroundColor: "#007AFF",
            padding: 15,
            borderRadius: 15,
          }}
          onPress={handleConfirmAndCreate}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Confirm and create
          </Text>
        </TouchableOpacity>

        <StatusBar style="auto" />
      </View>
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 90,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  inputFocus: {
    borderColor: "black",
    borderWidth: 0.5,
  },
  buttonContainer: {
    marginBottom: 10,
  },
  dateText: {
    margin: 20,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
    backgroundColor: "white",
    padding: 15,
    fontSize: 12,
    borderRadius: 10,
  },
  projectName: {
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  searchButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default CreateProjects;
