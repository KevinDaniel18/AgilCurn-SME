import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../HomeScreen";
import ProjectsScreen from "../ProjectsScreen";
import TasksScreen from "../TasksScreen";
import BoardScreen from "../BoardScreen";

const Tab = createBottomTabNavigator();

const Navbar = () => {
  return (
      <Tab.Navigator
        initialRouteName="Home"
        screenOptions={{
          tabBarActiveTintColor: "#ff9400",
          tabBarInactiveTintColor: "gray",
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={HomeScreen}
          options={{
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
