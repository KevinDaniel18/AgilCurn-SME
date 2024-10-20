import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Pressable,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useRoute } from "@react-navigation/native";
import {
  getBottlenecks,
  getProjectStatus,
  getTeamProductivity,
} from "../../api/endpoint";
import { Pie, PolarChart, CartesianChart, Line } from "victory-native";
import { Table, Row, Rows } from "react-native-table-component";
import { useFont } from "@shopify/react-native-skia";
import inter from "../../../assets/fonts/Inter-Regular.ttf";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { Feather } from "@expo/vector-icons";

export const Spinner = () => (
  <View style={styles.spinnerContainer}>
    <ActivityIndicator size="large" color="#4f9d9d" />
  </View>
);

const ReportScreen = () => {
  const route = useRoute();
  const { projectId, projectName, startDate, endDate } = route.params;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const [projectStatus, setProjectStatus] = useState(null);
  const [teamProductivity, setTeamProductivity] = useState(null);
  const [bottlenecks, setBottlenecks] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalBottle, setModalBottle] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState("");

  const font = useFont(inter, 12);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        if (isInitialLoading) setIsLoading(true);
        const statusResponse = await getProjectStatus(projectId);
        const filteredStatus = statusResponse.data.find(
          (project) => project.projectId === projectId
        );
        setProjectStatus(filteredStatus);

        const productivityResponse = await getTeamProductivity(
          projectId,
          start,
          end
        );
        setTeamProductivity(productivityResponse.data);

        const bottlenecksResponse = await getBottlenecks();
        setBottlenecks(bottlenecksResponse.data);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setIsLoading(false);
        if (isInitialLoading) setIsInitialLoading(false);
      }
    };

    if (projectId && start && end) {
      console.log("fetch reports");
      fetchReports();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectStatus && projectStatus.endDate) {
      const endDate = new Date(projectStatus.endDate);

      const updateRemainingTime = () => {
        const now = new Date();
        const timeDiff = endDate - now;

        if (timeDiff <= 0) {
          setTimeRemaining("Project completed");
          return;
        }

        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDiff / 1000) % 60);

        setTimeRemaining(
          `${days}d ${hours}h ${minutes}m ${seconds}s remaining`
        );
      };

      updateRemainingTime();
      const intervalId = setInterval(updateRemainingTime, 1000);

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [projectStatus]);

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
    let totalCompletedTasks = 0;
    let totalIncompleteTasks = 0;
    let totalInProgressTasks = 0;
    const formattedData = productivity.map((user) => {
      totalCompletedTasks += user.completedTasks;
      totalIncompleteTasks += user.incompleteTasks;
      totalInProgressTasks += user.inProgressTasks;
      return {
        userName: user.userName,
        completedTasks: user.completedTasks,
        inProgressTasks: user.inProgressTasks,
        incompleteTasks: user.incompleteTasks,
      };
    });

    formattedData.push({
      userName: "Total",
      completedTasks: totalCompletedTasks,
      incompleteTasks: totalIncompleteTasks,
      inProgressTasks: totalInProgressTasks,
    });

    return formattedData;
  };

  const data = teamProductivity ? formatProductivityData(teamProductivity) : [];

  const tableHead = [
    "Task ID",
    "Task Title",
    "Project Name",
    "Days in Progress",
  ];

  const tableData = bottlenecks?.map((bottleneck) => [
    bottleneck.taskId,
    bottleneck.taskTitle,
    bottleneck.projectName,
    bottleneck.daysInProgress,
  ]);

  function openModal() {
    setModalVisible(true);
  }

  function openBottleNeckModal() {
    setModalBottle(true);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.chartContainer}>
        <Text style={styles.title}>{projectName} Status</Text>
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
              <Text></Text>
              <View style={[styles.statusStyle, { backgroundColor: "gray" }]} />
              <Text>To Do</Text>
              <View
                style={[styles.statusStyle, { backgroundColor: "green" }]}
              />
              <Text>Done</Text>
            </View>
            <Text style={styles.timeRemaining}>{timeRemaining}</Text>
          </>
        ) : (
          <Spinner />
        )}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.title}>Team Productivity</Text>
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            alignItems: "center",
            gap: 10,
            marginTop: 20,
          }}
        >
          <View style={[styles.statusStyle, { backgroundColor: "red" }]} />
          <Text>To Do</Text>
          <View style={[styles.statusStyle, { backgroundColor: "orange" }]} />
          <Text>In Progress</Text>
          <View style={[styles.statusStyle, { backgroundColor: "green" }]} />
          <Text>Done</Text>
        </View>
        {data.length > 0 ? (
          <>
            <CartesianChart
              data={data}
              xKey="userName"
              yKeys={["completedTasks", "incompleteTasks", "inProgressTasks"]}
              padding={16}
              domainPadding={{ left: 50, right: 50, top: 30 }}
              axisOptions={{
                font,
                tickCount: { x: 0, y: 4 },
                formatXLabel: (x) => (x === "total" ? x : "user"),
                formatYLabel: (d) => `${d} tasks`,
              }}
            >
              {({ points }) => {
                return (
                  <>
                    <Line
                      points={points.completedTasks}
                      color="green"
                      strokeWidth={3}
                      animate={{ type: "timing", duration: 300 }}
                    />
                    <Line
                      points={points.inProgressTasks}
                      color="orange"
                      strokeWidth={3}
                      animate={{ type: "timing", duration: 300 }}
                    />
                    <Line
                      points={points.incompleteTasks}
                      color="red"
                      strokeWidth={3}
                      animate={{ type: "timing", duration: 300 }}
                    />
                  </>
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
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={styles.title}>Bottlenecks</Text>
          <TouchableOpacity onPress={openBottleNeckModal}>
            <Feather name="help-circle" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <Spinner />
        ) : bottlenecks?.length === 0 ? (
          <Text style={{ color: "gray", textAlign: "justify" }}>
            No bottlenecks were found.
          </Text>
        ) : (
          <Table borderStyle={{ borderWidth: 1 }}>
            <Row data={tableHead} style={styles.head} textStyle={styles.text} />
            <Rows data={tableData} textStyle={styles.text} />
          </Table>
        )}
      </View>

      <Modal
        transparent={true}
        visible={modalBottle}
        onRequestClose={() => {
          setModalBottle(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text>
              Tasks that have not had any changes for a period of 7 days will
              appear unless they are completed.
            </Text>
            <Pressable
              onPress={() => setModalBottle(false)}
              style={styles.bottleneckInfo}
            >
              <Text style={{ color: "white" }}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Completed tasks</Text>
              <Pressable onPress={() => setModalVisible(false)}>
                <AntDesign name="close" size={24} color="red" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalContent}>
              {teamProductivity && teamProductivity.length > 0 ? (
                teamProductivity.map(
                  ({
                    userId,
                    userName,
                    completedTasks,
                    incompleteTasks,
                    profileImage,
                  }) => (
                    <View key={userId} style={styles.taskContainer}>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Image
                          source={{ uri: profileImage }}
                          style={styles.profileImage}
                        />
                        <Text style={styles.userText}>{userName}</Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          marginTop: 10,
                        }}
                      >
                        <MaterialIcons name="done" size={24} color="green" />
                        <Text style={styles.taskText}>
                          Completed tasks: {completedTasks} of {incompleteTasks}
                        </Text>
                      </View>
                    </View>
                  )
                )
              ) : (
                <Text style={styles.noDataText}>There is no productivity.</Text>
              )}
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
    backgroundColor: "#f0f2f5",
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
  bottleneckInfo: {
    backgroundColor: "gray",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
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
  noDataText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
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
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
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
  timeRemaining: {
    marginTop: 20,
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
  head: { height: 60, backgroundColor: "#f1f8ff" },
  text: { margin: 6 },
});

export default ReportScreen;
