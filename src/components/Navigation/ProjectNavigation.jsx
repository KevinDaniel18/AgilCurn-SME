import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import Navbar from "./NavBar";
import CreateProjects from "../CreateProjects";

const Stack = createStackNavigator();

const ProjectNavigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        options={{ headerShown: false }}
        name="Navbar"
        component={Navbar}
      />
      <Stack.Screen name="CreateProjects" component={CreateProjects} />
    </Stack.Navigator>
  );
};

export default ProjectNavigation;
