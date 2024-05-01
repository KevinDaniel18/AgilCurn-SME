import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  ALERT_TYPE,
  Dialog,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import Toast from "react-native-toast-message";
import { postUser } from "../../api/endpoint";

const RegisterScreen = ({ navigation }) => {
  const [userData, setUserData] = useState({
    fullname: "",
    email: "",
    password: "",
    repeatPassword: "",
  });

  //get inputs values
  const getInput = (name, value) => {
    setUserData((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      const { fullname, email, password, repeatPassword } = userData;

      //validations
      if (!fullname.trim()) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Full name required",
          textBody: "Please enter your full name.",
          button: "close",
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Invalid email",
          textBody: "Por favor ingresa un correo electrónico válido. Example: user@gmail.com ",
          button: "close",
        });
        return;
      }

      if (password.length < 6) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Invalid password",
          textBody: "The password must be at least 6 characters.",
          button: "close",
        });
        return;
      }

      if (password !== repeatPassword) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Passwords do not match",
          textBody: "Please make sure the passwords match.",
          button: "close",
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
        navigation.navigate("Login");
      }, 4000);
    } catch (error) {
      
      Toast.show({
        type: "error",
        text1: error.message,
        text2: "Email already exist",
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };

  const navigateToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Register</Text>

        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Fullname"
            onChangeText={(text) => getInput("fullname", text)}
            value={userData.fullname}
          />
        </View>

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

        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Password"
            onChangeText={(text) => getInput("password", text)}
            value={userData.password}
            secureTextEntry
          />
        </View>

        <View style={styles.inputView}>
          <TextInput
            style={styles.input}
            placeholder="Repeat password"
            onChangeText={(text) => getInput("repeatPassword", text)}
            value={userData.repeatPassword}
            secureTextEntry
          />
        </View>
        <View style={styles.actionContainer}>
          <Button
            title="REGISTER"
            style={styles.registerButton}
            onPress={handleRegister}
          />
          <TouchableOpacity onPress={navigateToLogin}>
            <Text style={styles.loginText}>Do you already have an account? Get into</Text>
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
});

export default RegisterScreen;
