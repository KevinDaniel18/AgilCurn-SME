import React, { useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, Image } from "react-native";
import HomeScreen from "../Screens/HomeScreen";
import ProjectsScreen from "../Screens/ProjectsScreen";
import TasksScreen from "../Screens/TasksScreen";
import BoardScreen from "../Screens/BoardScreen";
import { useProject } from "../StoreProjects/ProjectContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getUserById } from "../../api/endpoint";

const Tab = createBottomTabNavigator();

const Navbar = ({ navigation }) => {
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [userId, setUserId] = useState(null);
  const { profileImage } = useProject();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(Number(storedUserId));
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    setLocalProfileImage(profileImage);
  }, [profileImage]);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (userId) {
        const res = await getUserById(userId);
        setLocalProfileImage(res.data.profileImage);
      }
    };

    loadProfileImage();
  }, [userId]);

  return (
    <Tab.Navigator
      initialRouteName="HeaderNav"
      screenOptions={{
        tabBarActiveTintColor: "#ff9400",
        tabBarInactiveTintColor: "gray",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          title: "agilCurn",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Account");
              }}
            >
              {localProfileImage ? (
                <Image
                  source={{
                    uri: localProfileImage,
                  }}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    marginRight: 20,
                  }}
                />
              ) : (
                <Ionicons
                  name="person-circle-outline"
                  size={28}
                  color="black"
                  style={{ marginRight: 20 }}
                />
              )}
            </TouchableOpacity>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Board"
        component={BoardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" color={color} size={size} />
          ),
        }}
      />
      
    </Tab.Navigator>
  );
};

export default Navbar;
