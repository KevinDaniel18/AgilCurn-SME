import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableWithoutFeedback,
} from "react-native";
import { useState } from "react";
import UserLoginScreen from "./UserLoginScreen";
import AdminLoginScreen from "./AdminLoginScreen";
import { Toast } from "react-native-toast-message/lib/src/Toast";

export default function LoginScreen({ navigation }) {
  const [activeScreen, setActiveScreen] = useState("user"); // "user" or "admin"

  const toggleScreen = (screen) => {
    setActiveScreen(screen);
  };

  const toast = (type, text1, text2, visibilityTime, autoHide) => {
    Toast.show({
      type,
      text1,
      text2,
      visibilityTime,
      autoHide,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/agilcurn-logo.png")}
              style={styles.logo}
            />
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeScreen === "user" && styles.activeTabButton,
              ]}
              onPress={() => toggleScreen("user")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeScreen === "user" && styles.activeTabText,
                ]}
              >
                Usuario
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeScreen === "admin" && styles.activeTabButton,
              ]}
              onPress={() => toggleScreen("admin")}
            >
              <Text
                style={[
                  styles.tabText,
                  activeScreen === "admin" && styles.activeTabText,
                ]}
              >
                Administrador
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contentContainer}>
            {activeScreen === "user" ? (
              <UserLoginScreen navigation={navigation} toast={toast} />
            ) : (
              <AdminLoginScreen navigation={navigation} toast={toast} />
            )}
          </View>
          <Toast />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  logo: {
    height: 80,
    width: 80,
    marginBottom: 30,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 10,
    backgroundColor: "#e0e0e0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: "center",
    backgroundColor: "#e0e0e0",
  },
  activeTabButton: {
    backgroundColor: "#ff7b00", // Orange color
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  activeTabText: {
    color: "white",
  },
  contentContainer: {
    flex: 1,
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 20,
    marginBottom: 10,
  },
});
