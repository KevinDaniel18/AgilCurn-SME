import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AlertNotificationRoot } from "react-native-alert-notification";
import Toast from "react-native-toast-message";
import { postUser } from "../../api/endpoint";
import AntDesign from "@expo/vector-icons/AntDesign";

const RegisterScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [error, setError] = useState({
    fullname: "",
    email: "",
    password: "",
    repeatPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(false);
  const [passwordLengthValid, setPasswordLengthValid] = useState(false);

  //get inputs values
  const getInput = (name, value) => {
    setUserData((prevValue) => ({ ...prevValue, [name]: value }));
    setError((prevErrors) => ({ ...prevErrors, [name]: "" }));

    if (name === "password" || name === "repeatPassword") {
      const { password, repeatPassword } = {
        ...userData,
        [name]: value,
      };

      setPasswordMatch(password === repeatPassword);
      setPasswordLengthValid(password.length >= 6);
    }
  };

  const handleRegister = async () => {
    try {
      setLoading(true);
      const { fullname, email, password, repeatPassword } = userData;
      let valid = true;
      let newErrors = {};

      //validations
      if (!fullname.trim()) {
        newErrors.fullname = "Please enter your full name.";
        valid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address.";
        valid = false;
      }

      if (password.length < 6) {
        newErrors.password = "The password must be at least 6 characters.";
        valid = false;
      }

      if (password !== repeatPassword) {
        newErrors.repeatPassword = "Passwords do not match.";
        valid = false;
      }

      if (!valid) {
        setError(newErrors);
        //Alert.alert("Invalid Inputs", "Please correct the highlighted errors");
        Toast.show({
          type: "info",
          text1: "Invalid Inputs",
          text2: "Please correct the highlighted errors",
          autoHide: true,
        });
        return;
      }

      //post an user
      await postUser(userData);

      Toast.show({
        type: "success",
        text1: "Succes!",
        text2: "Data registered, now you can log in",
        visibilityTime: 4000,
        autoHide: true,
      });

      setTimeout(() => {
        navigation.navigate("AuthFlow", { screen: "Login" });
      }, 2000);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Email already exist",
        visibilityTime: 4000,
        autoHide: true,
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("AuthFlow", { screen: "Login" });
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>

        {error.fullname ? (
          <Text style={styles.errorText}>{error.fullname}</Text>
        ) : null}
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Fullname"
            onChangeText={(text) => getInput("fullname", text)}
            value={userData.fullname}
          />
        </View>

        {error.email ? (
          <Text style={styles.errorText}>{error.email}</Text>
        ) : null}
        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            onChangeText={(text) => getInput("email", text)}
            value={userData.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {error.password ? (
          <View>
            <Text style={styles.errorText}>{error.password}</Text>
          </View>
        ) : null}
        <View style={styles.inputViewPass}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="Password"
            onChangeText={(text) => getInput("password", text)}
            value={userData.password}
            secureTextEntry
          />
          {passwordLengthValid && (
            <View style={styles.iconContainer}>
              <AntDesign name="check" size={24} color="green" />
            </View>
          )}
        </View>

        {error.repeatPassword ? (
          <Text style={styles.errorText}>{error.repeatPassword}</Text>
        ) : null}
        <View style={styles.inputViewPass}>
          <TextInput
            style={{ flex: 1 }}
            placeholder="Repeat password"
            onChangeText={(text) => getInput("repeatPassword", text)}
            value={userData.repeatPassword}
            secureTextEntry
          />
          {passwordMatch && passwordLengthValid && (
            <View style={styles.iconContainer}>
              <AntDesign name="check" size={24} color="green" />
            </View>
          )}
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity
            onPress={handleRegister}
            style={{
              backgroundColor: "#2196F3",
              padding: 15,
              borderRadius: 10,
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Register
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginText}>
              Do you already have an account? Get into
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <Toast />
    </AlertNotificationRoot>
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
  inputViewPass: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    position: "absolute",
    right: 15,
    zIndex: 1,
    padding: 5,
  },
  registerButton: {
    width: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 25,
    padding: 15,
  },
  loginText: {
    color: "#29374a",
    textDecorationLine: "underline",
    marginTop: 15,
  },
  actionContainer: {
    marginTop: 60,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
});

export default RegisterScreen;
