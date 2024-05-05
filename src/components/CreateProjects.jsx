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

  const handleConfirmAndCreate = () => {
    if (handleValidate()) {
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Success",
        textBody: "Now you can see the status of your project in dashboard",
        button: "close",
      });
      addProject({ projectName, endDate });
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
          <Button
            title="Select a start date"
            onPress={() => handleDateSelection("start")}
            color="#5cdb95"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Select an end date"
            onPress={() => handleDateSelection("end")}
            color="#ff6b6b"
          />
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
        <View>
          <Button title="Confirm and create" onPress={handleConfirmAndCreate} />
        </View>
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
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  inputFocus: {
    borderColor: "#ffa500",
    borderWidth: 2,
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
    padding: 10,
    fontSize: 12,
  },
  projectName: {
    fontWeight: "bold",
  },
});

export default CreateProjects;
