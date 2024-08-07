// @ts-ignore
import React from "react";
import ProjectNavigation from "./src/components/Navigation/ProjectNavigation";
import { ProjectProvider } from "./src/components/StoreProjects/ProjectContext";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "./src/components/Screens/LoginScreen";
import RegisterScreen from "./src/components/Screens/RegisterScreen";
import Forgot from "./src/components/Screens/Forgot";
import SettingsScreen from "./src/components/Screens/SettingsScreen";
import {
  AuthProvider,
  useAuth,
} from "./src/components/AuthContext/AuthContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Stack = createStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ProjectProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProjectProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const AppNavigator = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn ? (
        <Stack.Screen name="Root" component={ProjectNavigation} />
      ) : (
        <>
          <Stack.Screen name="AuthFlow" component={AuthFlow} />
        </>
      )}
    </Stack.Navigator>
  );
};

const AuthFlow = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPass" component={Forgot} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
};
