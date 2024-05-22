import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Button,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Octicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { StatusBar } from "expo-status-bar";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import { useProject } from "./StoreProjects/ProjectContext";
import { addMembers } from "../api/endpoint";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const CreateProjects = () => {
  const [projectName, setProjectName] = useState("");
  const [projectNameFocus, setProjectNameFocus] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [mode, setMode] = useState("date");
  const [dateType, setDateType] = useState("");
  const [warningShow, setWarningShow] = useState(false);
  const [email, setEmail] = useState("");
  const [emails, setEmails] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [invitationSent, setInvitationSent] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const { addProject, updateInvitedUserName } = useProject();

  const handleInvitationConfirmation = async (email) => {
    try {
      const response = await axios.get(
        `http://192.168.1.6:3000/auth/invitation-confirmation?email=${encodeURIComponent(
          email
        )}&name=${encodeURIComponent("")}`
      );
      if (response.status === 200) {
        const confirmedUserName = response.data.name;
        updateInvitedUserName(confirmedUserName);
        return response.data.name;
      }
    } catch (error) {
      if (error.response && error.response.status == 404) {
        console.log("User not found:", error.response.data);
      } else {
        console.error("Error confirming invitation:", error.message);
      }
      return "User";
    }
  };

  const handleAddMembers = () => {
    setModalVisible(true);
  };

  const handleSearchMembers = () => {
    setEmails((prevEmails) => [...prevEmails, email]);
    setModalVisible(false);
    setEmail("");
  };

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
        const res = await addMembers(emails, projectName);
        if (res.status === 200) {
          setInvitationSent(true);

          const invitedUserNames = await Promise.all(
            emails.map(async (email) => {
              const userName = await handleInvitationConfirmation(email);
              return { email, name: userName };
            })
          );
          setInvitedUsers(invitedUserNames);
        }
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
      setEmails([]);
    }
  };

  const handleRemoveUser = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setInvitedUsers([]);
      console.log("User removed");
    } catch (error) {
      console.error("Error removing", error);
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
        <View>
          <Button title="Add members" onPress={handleAddMembers} />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalText}>Enter member's email:</Text>
              <TextInput
                style={styles.modalInput}
                value={email}
                onChangeText={(text) => setEmail(text)}
              />
              <TouchableOpacity
                style={styles.searchButton}
                onPress={handleSearchMembers}
              >
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
        {invitationSent ? (
          <View>
            <Text>Invitation sent successfully</Text>
            {invitedUsers.length > 0 &&
              invitedUsers.map((user) => (
                <Text key={user.email}>
                  {user.name} ({user.email})
                </Text>
              ))}
          </View>
        ) : (
          <View>
            <Button
              title="Confirm and create"
              onPress={handleConfirmAndCreate}
            />
          </View>
        )}
        <Button title="Remove User" onPress={handleRemoveUser} />
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
