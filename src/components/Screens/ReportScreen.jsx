import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  Button,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  getBottlenecks,
  getProjectStatus,
  getTeamProductivity,
} from "../../api/endpoint";
import { Bar, Pie, PolarChart, CartesianChart, Line } from "victory-native";
import { LinearGradient, vec } from "@shopify/react-native-skia";
import { useFont } from "@shopify/react-native-skia";
import inter from "../../../assets/fonts/Inter-Regular.ttf";

export const Spinner = () => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size="large" color="#4f9d9d" />
  </View>
);

const ReportScreen = () => {
  const route = useRoute();
  const { projectId, startDate, endDate } = route.params;
  const [projectStatus, setProjectStatus] = useState(null);
  const [teamProductivity, setTeamProductivity] = useState(null);
  const [bottlenecks, setBottlenecks] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const font = useFont(inter, 12);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const statusResponse = await getProjectStatus(projectId);
        const filteredStatus = statusResponse.data.find(
          (project) => project.projectId === projectId
        );
        setProjectStatus(filteredStatus);

        const productivityResponse = await getTeamProductivity(
          startDate,
          endDate
        );
        setTeamProductivity(productivityResponse.data);
        console.log(productivityResponse.data);

        const bottlenecksResponse = await getBottlenecks();
        setBottlenecks(bottlenecksResponse.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    if (projectId && startDate && endDate) {
      fetchReports();
    }
  }, [projectId, startDate, endDate]);

  const DATA = projectStatus
    ? [
        {
          label: "Progress",
          value: projectStatus.progressPercentage,
          color: "green",
        },
        {
          label: "Remaining",
          value: 100 - projectStatus.progressPercentage,
          color: "grey",
        },
      ]
    : [];

  const formatProductivityData = (productivity) => {
    return productivity.map((user) => ({
      userName: user.userName,
      completedTasks: user.completedTasks,
    }));
  };

  const data = teamProductivity ? formatProductivityData(teamProductivity) : [];  

  function openModal() {
    console.log("opening modal");
    setModalVisible(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.title}>Project Status</Text>
        <Text style={{ color: "gray", marginBottom: 20 }}>
          According to the tasks completed.
        </Text>
        {projectStatus ? (
          <>
            <PolarChart
              data={DATA}
              labelKey={"label"}
              valueKey={"value"}
              colorKey={"color"}
            >
              <Pie.Chart />
            </PolarChart>
            <View
              style={{
                flexDirection: "row",
                alignSelf: "center",
                alignItems: "center",
                gap: 10,
                marginTop: 20,
              }}
            >
              <Text>To do</Text>
              <View style={[styles.statusStyle, { backgroundColor: "gray" }]} />
              <Text>Done</Text>
              <View
                style={[styles.statusStyle, { backgroundColor: "green" }]}
              />
            </View>
          </>
        ) : (
          <Spinner />
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.title}>Team Productivity</Text>
        {data.length > 0 ? (
          <>
            <CartesianChart
              data={data}
              xKey="userName"
              yKeys={["completedTasks"]}
              padding={16}
              domainPadding={{ left: 50, right: 50, top: 30 }}
              axisOptions={{
                font,
                tickCount: { x: 0, y: 4 },
                formatXLabel: (x) => `User`,
                formatYLabel: (d) => `${d} tasks`,
              }}
            >
              {({ points, chartBounds }) => {
                return (
                  <Bar
                    chartBounds={chartBounds}
                    points={points.completedTasks}
                    roundedCorners={{ topLeft: 5, topRight: 5 }}
                  >
                    <LinearGradient
                      start={vec(0, 0)}
                      end={vec(0, 400)}
                      colors={["#4f9d9d", "#4f9d9d50"]}
                    />
                  </Bar>
                );
              }}
            </CartesianChart>
            <TouchableOpacity
              style={{
                backgroundColor: "gray",
                padding: 10,
                borderRadius: 10,
                width: 90,
                alignSelf: "center",
              }}
              onPress={openModal}
            >
              <Text
                style={{
                  textAlign: "center",
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Info
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Spinner />
        )}
      </View>

      <View style={styles.bottlenecksContainer}>
        <Text style={styles.title}>Bottlenecks</Text>
        <Text style={styles.bottlenecksText}>
          {bottlenecks ? JSON.stringify(bottlenecks) : "Loading..."}
        </Text>
      </View>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          console.log("Modal close requested"); // Verificar si esta línea se imprime
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completed tasks</Text>
              <Button
                title="X"
                color="#999"
                onPress={() => setModalVisible(false)}
              />
            </View>
            <ScrollView style={styles.modalContent}>
              {teamProductivity?.map(({ userId, userName, completedTasks }) => (
                <View key={userId} style={styles.taskContainer}>
                  <Text style={styles.userText}>👤 {userName}</Text>
                  <Text style={styles.taskText}>
                    ✅ Completed tasks: {completedTasks}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  spinnerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  chartContainer: {
    height: 400,
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
  },
  loadingText: {
    fontSize: 16,
    color: "#888",
  },
  bottlenecksContainer: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bottlenecksText: {
    fontSize: 16,
    color: "#333",
  },
  statusStyle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    backgroundColor: "#ff5c5c",
    borderRadius: 15,
    padding: 5,
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  modalContent: {
    width: "100%",
    marginTop: 10,
  },
  taskContainer: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  userText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  taskText: {
    fontSize: 14,
    color: "#888",
    marginTop: 5,
  },
});

export default ReportScreen;
