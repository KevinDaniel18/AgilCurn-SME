import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import MessageScreen from "../Message/MessageScreen";
import Header from "../Header";

const Stack = createStackNavigator();

const HeaderNavigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          options={{ headerShown: false }}
          name="HeaderNav"
          component={Header}
        />
        <Stack.Screen
          name="MessageScreen"
          component={MessageScreen}
          options={{ title: "Chat" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default HeaderNavigation;
