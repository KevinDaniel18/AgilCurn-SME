import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
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

  const getInput = (name, value) => {
    setUserData((prevValue) => ({ ...prevValue, [name]: value }));
  };

  const handleRegister = async () => {
    try {
      const { fullname, email, password, repeatPassword } = userData;

      if (!fullname.trim()) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Nombre completo requerido",
          textBody: "Por favor ingresa tu nombre completo.",
          button: "close",
        });
        return;
      }

      // Validar correo electrónico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Correo electrónico inválido",
          textBody: "Por favor ingresa un correo electrónico válido.",
          button: "close",
        });
        return;
      }

      // Validar contraseña
      if (password.length < 6) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Contraseña inválida",
          textBody: "La contraseña debe tener al menos 6 caracteres.",
          button: "close",
        });
        return;
      }

      // Verificar si las contraseñas coinciden
      if (password !== repeatPassword) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Contraseñas no coinciden",
          textBody: "Por favor asegúrate de que las contraseñas coincidan.",
          button: "close",
        });
        return;
      }

      await postUser(userData);

      Toast.show({
        type: "success",
        text1: "Éxito!",
        text2: "Datos registrados, ahora puedes iniciar sesión",
        visibilityTime: 4000, // Tiempo de visibilidad de la notificación en milisegundos
        autoHide: true,
      });

      navigation.navigate("Login");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
        visibilityTime: 4000,
        autoHide: true,
      });
      console.error("error", error);
    }

    // Si la validación es exitosa, navegar a la pantalla de inicio de sesión

    // Navegar a la pantalla de inicio de sesión después de mostrar la notificación
    //setTimeout(() => {}, 2000); // Espera 2 segundos antes de navegar
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Registro</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre completo"
          onChangeText={(text) => getInput("fullname", text)}
          value={userData.fullname}
        />
        <TextInput
          style={styles.input}
          placeholder="Correo electrónico"
          onChangeText={(text) => getInput("email", text)}
          value={userData.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          onChangeText={(text) => getInput("password", text)}
          value={userData.password}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Repetir Contraseña"
          onChangeText={(text) => getInput("repeatPassword", text)}
          value={userData.repeatPassword}
          secureTextEntry
        />
        <Button title="Registrar" onPress={handleRegister} />
      </View>
      <Toast />
    </AlertNotificationRoot>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // Cambiar color de fondo a blanco
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold", // Añadir negrita al título
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#ccc", // Cambiar color del borde a gris claro
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
});

export default RegisterScreen;
