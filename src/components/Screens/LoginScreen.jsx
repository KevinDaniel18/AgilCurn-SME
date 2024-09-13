import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image
} from "react-native";
import Toast from "react-native-toast-message";
import { loginUser } from "../../api/endpoint";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext/AuthContext";
import Feather from "@expo/vector-icons/Feather";

const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

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

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <View style={styles.container}>
       <Image
        source={require("../../../assets/agilcurn-logo.png")}
        style={{height: 80, width: 80, marginBottom: 30}}
      />

      <View style={styles.inputView1}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={{flex: 1}}
          placeholder="Password"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.icon}
        >
          <Feather
            name={passwordVisible ? "eye-off" : "eye"}
            size={20}
            color="gray"
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        onPress={navigateToForgotPassword}
        style={styles.forgotPasswordText}
      >
        <Text style={styles.forgotPasswordText}>Forgot password?</Text>
      </TouchableOpacity>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          style={{ backgroundColor: "#2196F3", padding: 15, borderRadius: 10 }}
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "bold" }}
          >
            Login
          </Text>
        </TouchableOpacity>
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
  inputView1: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
  },
  inputView: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  icon: {
    padding: 5,
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
    fontWeight: "bold",
    fontStyle: "italic"
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
