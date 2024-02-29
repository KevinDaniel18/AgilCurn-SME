import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Navbar from "./NavBar";
import CreateProjects from "../CreateProjects";

const Stack = createStackNavigator();

const ProjectNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="Home"
          component={Navbar}
        />
        <Stack.Screen name="CreateProjects" component={CreateProjects} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default ProjectNavigation;
