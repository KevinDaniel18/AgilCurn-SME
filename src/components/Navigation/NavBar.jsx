import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import HomeScreen from "../Screens/HomeScreen";
import ProjectsScreen from "../Screens/ProjectsScreen";
import TasksScreen from "../Screens/TasksScreen";
import BoardScreen from "../Screens/BoardScreen";
import SettingsScreen from "../Screens/SettingsScreen";
import UsersScreen from "../Screens/UsersScreen";

const Tab = createBottomTabNavigator();

const Navbar = ({ navigation }) => {
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
              onPress={() => navigation.navigate("MessageScreen")}
            >
              <Ionicons
                name="chatbox-outline"
                size={28}
                color="black"
                style={{ marginRight: 20 }}
              />
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
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="UsersScreen"
        component={UsersScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default Navbar;
