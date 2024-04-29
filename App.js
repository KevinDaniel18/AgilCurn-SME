import { View, StyleSheet } from "react-native";
import React, { useState } from "react";
import ProjectNavigation from "./src/components/Navigation/ProjectNavigation";
import { ProjectProvider } from "./src/components/StoreProjects/ProjectContext";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Header from "./src/components/Header";
import LoginScreen from "./src/components/Screens/LoginScreen";
import RegisterScreen from "./src/components/Screens/RegisterScreen";

const Stack = createStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ProjectProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Root" component={Root} />
          ) : (
            <>
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen {...props} setIsLoggedIn={setIsLoggedIn} />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ProjectProvider>
  );
}

const Root = () => {
  return (
    <View style={styles.container}>
      <Header />
      <ProjectNavigation />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
