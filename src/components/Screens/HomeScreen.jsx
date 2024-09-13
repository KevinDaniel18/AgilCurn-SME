import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useProject } from "../StoreProjects/ProjectContext";
import { getUserProjects } from "../../api/endpoint";
import * as Progress from "react-native-progress";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const { projects, setProjects } = useProject();
  const [refreshing, setRefreshing] = useState(false);
  const [progressValues, setProgressValues] = useState({});
  const [animatedProgressValues, setAnimatedProgressValues] = useState({});

  const fetchProjects = async () => {
    setRefreshing(true);
    try {
      const userId = await AsyncStorage.getItem("userId");
      console.log("Retrieved userId from AsyncStorage:", userId);
      if (userId) {
        const response = await getUserProjects(userId);
        const projects = response.data.map((project) => ({
          ...project,
          startDate: new Date(project.startDate),
          endDate: new Date(project.endDate),
        }));
        setProjects(projects);
        await AsyncStorage.setItem("projects", JSON.stringify(projects));
      } else {
        console.error("No userId found in AsyncStorage");
      }
    } catch (error) {
      console.error("No userId found in AsyncStorage");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [setProjects]);

  useEffect(() => {
    const calculateProgress = (startDate, endDate) => {
      const currentDate = new Date();
      const totalTime = endDate.getTime() - startDate.getTime();
      const elapsedTime = Math.min(
        currentDate.getTime() - startDate.getTime(),
        totalTime
      );
      return elapsedTime / totalTime;
    };

    const progress = projects.reduce((acc, project) => {
      acc[project.id] = calculateProgress(project.startDate, project.endDate);
      return acc;
    }, {});

    setProgressValues(progress);
  }, [projects]);

  useEffect(() => {
    const animateProgress = (startValue, endValue, duration, projectId) => {
      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(
          (elapsed / duration) * (endValue - startValue),
          endValue - startValue
        );
        setAnimatedProgressValues((prevState) => ({
          ...prevState,
          [projectId]: startValue + progress,
        }));
        if (startValue + progress < endValue) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    Object.keys(progressValues).forEach((projectId) => {
      animateProgress(0, progressValues[projectId], 2000, projectId);
    });
  }, [progressValues]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={fetchProjects} />
      }
    >
      {projects.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>You do not have projects yet.</Text>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("CreateProjects");
            }}
          >
            <Text
              style={{
                color: "orange",
                textDecorationLine: "underline",
                fontWeight: "bold",
                fontStyle: "italic",
              }}
            >
              Add project
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {projects.map((project, index) => (
            <TouchableOpacity
              style={styles.projectContainer}
              key={index}
              onPress={() => {
                navigation.navigate("ReportScreen", {
                  projectId: project.id,
                  startDate: project.startDate,
                  endDate: project.endDate
                });
              }}
            >
              <Text style={styles.projectName}>{project.projectName}</Text>
              <Text style={styles.endDate}>
                Start Date:{" "}
                {project.startDate
                  ? project.startDate.toLocaleDateString()
                  : "Unknown"}{" "}
                - End Date:{" "}
                {project.endDate
                  ? project.endDate.toLocaleDateString()
                  : "Unknown"}
              </Text>
              <Text style={styles.projectId}>ID: {project.id}</Text>

              <Progress.Bar
                progress={animatedProgressValues[project.id] || 0}
                width={300}
                color="#007AFF"
                unfilledColor="#dddddd"
                borderColor="transparent"
                borderRadius={5}
                height={20}
              />
            </TouchableOpacity>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
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
  projectId: {
    fontWeight: "bold",
  },
  invitedUserName: {
    fontSize: 14,
    color: "#666666",
    marginTop: 10,
  },
});

export default HomeScreen;
