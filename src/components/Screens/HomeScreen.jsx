import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useProject } from "../StoreProjects/ProjectContext";
import * as Progress from "react-native-progress";

const HomeScreen = () => {
  const { projects, invitedUserName } = useProject();

  const calculateProgress = (startDate, endDate) => {
    const currentDate = new Date();
    const totalTime = endDate.getTime() - startDate.getTime();
    const elapsedTime = Math.min(
      currentDate.getTime() - startDate.getTime(),
      totalTime
    );
    const progress = (elapsedTime / totalTime) * 100;
    console.log(progress);
    return Math.min(progress, 100);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {projects.map((project, index) => (
        <View style={styles.projectContainer} key={index}>
          <Text style={styles.projectName}>{project.projectName}</Text>
          <Text style={styles.endDate}>
            Start Date:{" "}
            {project.startDate
              ? project.startDate.toLocaleDateString()
              : "Unknown"}{" "}
            - End Date:{" "}
            {project.endDate ? project.endDate.toLocaleDateString() : "Unknown"}
          </Text>

          <Progress.Bar
            progress={calculateProgress(new Date(), project.endDate) / 100}
            width={300}
            color="#007AFF"
            unfilledColor="#dddddd"
            borderColor="transparent"
            borderRadius={5}
            height={20}
          />
          {invitedUserName && (
            <Text style={styles.invitedUserName}>
              Participants: {invitedUserName}
            </Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  projectContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  projectName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  endDate: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 10,
  },
  invitedUserName: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
  },
});

export default HomeScreen;
