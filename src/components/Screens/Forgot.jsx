import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  TouchableOpacity,
} from "react-native";
import { Toast } from "react-native-toast-message/lib/src/Toast";
import { recoverPassword } from "../../api/endpoint";

const Forgot = ({ navigation }) => {
  const [email, setEmail] = useState("");

  const handleRecoverPassword = async () => {
    try {
      if (!email.trim()) {
        Toast.show({
          type: "info",
          text1: "Empty field",
          text2: "Please enter your email",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address",
          visibilityTime: 4000,
          autoHide: true,
        });
        return;
      }

      const response = await recoverPassword(email);

      if (response.status === 200) {
        // Éxito: mostrar un mensaje al usuario
        Toast.show({
          type: "success",
          text1: "Recovery email sent",
        });
      } else {
        // Error: mostrar un mensaje al usuario
        Toast.show({
          type: "error",
          text1: "Error sending recovery email",
        });
      }
    } catch (error) {
      // Error en la petición: mostrar un mensaje al usuario
      Toast.show({
        type: "error",
        text1: error.message,
        text2: "Email not found",
        visibilityTime: 4000,
        autoHide: true,
      });
    }
  };
  function backToLogin() {
    navigation.navigate("AuthFlow", {screen: "Login"});
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Password recovery</Text>

      <View style={styles.inputView}>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Email"
          onChangeText={(text) => setEmail(text)}
          value={email}
        />
      </View>

      <View style={styles.actionContainer}>
        <Button
          title="RECOVER"
          style={styles.recoverButton}
          onPress={handleRecoverPassword}
        />
        <TouchableOpacity onPress={backToLogin}>
          <Text style={styles.comeBackText}>Go back</Text>
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
    textAlign: "center",
  },
  inputView: {
    width: "80%",
    backgroundColor: "#f0f0f0",
    borderRadius: 25,
    padding: 15,
    marginBottom: 10,
  },
  actionContainer: {
    marginTop: 20,
  },
  recoverButton: {
    width: "100%",
    backgroundColor: "#4caf50",
    borderRadius: 25,
    padding: 15,
  },
  comeBackText: {
    color: "#29374a",
    textDecorationLine: "underline",
    marginTop: 15,
    textAlign: "center"
  },
});

export default Forgot;
