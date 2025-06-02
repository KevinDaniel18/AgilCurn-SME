// @ts-ignore
import "react-native-reanimated";
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
import SplashScreen from "./src/components/Screens/SplashScreen";
import { StatusBar } from "react-native";
import { UserProvider } from "./src/components/UserContext/UserContext";
import AdminNavigator from "./src/components/Navigation/AdminNavigator";

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#ffffff" />
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <ProjectProvider>
            <NavigationContainer>
              <UserProvider>
                <AppNavigator />
              </UserProvider>
            </NavigationContainer>
          </ProjectProvider>
        </AuthProvider>
      </GestureHandlerRootView>
    </>
  );
}

const AppNavigator = () => {
  const { isLoggedIn, loading, userType } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  if (isLoggedIn && userType === "admin") {
    return <AdminNavigator />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isLoggedIn && userType === "user" ? (
        <Stack.Screen name="Root" component={ProjectNavigation} />
      ) : (
        <>
          <Stack.Screen name="Splash" component={SplashScreen} />
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
