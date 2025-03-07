import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Navbar from "./NavBar";
import CreateProjects from "../CreateProjects";
import MessageScreen from "../Message/MessageScreen";
import UserListScreen from "../Message/UserListScreen";
import Account from "../Screens/Account";
import ManageAccount from "../Screens/ManageAccount";
import UserInfo from "../Screens/UserInfo";
import { TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import ReportScreen from "../Screens/ReportScreen";
import AttachDocuments from "../Screens/AttachDocuments";
import TaskList from "../Screens/TaskList";
import SprintList from "../Screens/SprintList";

const Stack = createStackNavigator();

const ProjectNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Navbar"
        component={Navbar}
      />
      <Stack.Screen
        name="CreateProjects"
        component={CreateProjects}
        options={{ title: "Create Projects" }}
      />
      <Stack.Screen
        name="MessageScreen"
        component={MessageScreen}
        options={({ navigation, route }) => ({
          title: route.params?.selectedUser?.name || "Chat",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("UserInfo", {
                  user: route.params.selectedUser,
                  currentUser: route.params.currentUser,
                  projectId: route.params.projectId,
                });
              }}
            >
              <AntDesign
                name="info"
                size={24}
                color="black"
                style={{ marginRight: 20 }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen
        name="UserListScreen"
        component={UserListScreen}
        options={{ title: "Chats" }}
      />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen
        name="ManageAccount"
        component={ManageAccount}
        options={{ title: "Manage Account" }}
      />
      <Stack.Screen
        name="UserInfo"
        component={UserInfo}
        options={{
          title: "Info",
          headerShown: false
        }}
      />
      <Stack.Screen
        name="ReportScreen"
        component={ReportScreen}
        options={{ title: "Reports" }}
      />
      <Stack.Screen
        name="AttachDocuments"
        component={AttachDocuments}
        options={{ title: "Documents" }}
      />
      <Stack.Screen
        name="TaskList"
        component={TaskList}
        options={{ title: "Task List" }}
      />
      <Stack.Screen
        name="SprintList"
        component={SprintList}
        options={{ title: "Sprint List" }}
      />
    </Stack.Navigator>
  );
};

export default ProjectNavigation;
