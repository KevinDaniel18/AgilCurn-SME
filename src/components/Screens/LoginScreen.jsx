import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import { loginUser } from "../../api/endpoint";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext/AuthContext";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigation();

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Toast.show({
          type: "info",
          text1: "empty fields",
          text2: "Please enter your information",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }
      const response = await loginUser(email, password);
      console.log(response);

      if (response.result && response.result.token) {
        login(response.result.token);
      } else {
        Toast.show({
          type: "error",
          text1: "Failed login",
          text2: "Por favor revisa tus credenciales",
          visibilityTime: 4000,
          autoHide: true,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Failed login",
        text2: "Data not found",
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const navigateToRegister = () => {
    navigation.navigate("Register");
  };

  const navigateToForgotPassword = () => {
    navigate.navigate("ForgotPass");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry
        />
      </View>
      <TouchableOpacity
        onPress={navigateToForgotPassword}
        style={styles.forgotPasswordText}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.actionContainer}>
        <Button
          title="LOGIN"
          style={styles.loginButton}
          onPress={handleLogin}
        />
        <TouchableOpacity onPress={navigateToRegister}>
          <Text style={styles.registerText}>
            You do not have an account? Sign up here
          </Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
  },
  inputView: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 10,
    padding: 10,
  },
  forgotPasswordText: {
    fontSize: 12,
    marginTop: 0,
    color: "#000",
    alignSelf: "flex-end",
    marginRight: 30,
  },
  registerText: {
    color: "#29374a",
    textDecorationLine: "underline",
    marginTop: 15,
  },
  actionContainer: {
    marginTop: 80,
  },
});

export default LoginScreen;
